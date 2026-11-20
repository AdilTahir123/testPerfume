"use server";

import { randomBytes } from "crypto";
import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { getUser } from "@/lib/auth";
import { getT } from "@/lib/lang";
import { sendOrderEmails } from "@/lib/email";
import { buildOrderText, notifyShopWhatsApp } from "@/lib/whatsapp-order";
import { coupons, orderItems, orders, paymentEvents, products } from "@/db/schema";
import { availability, isGateway, methodLabel, type Method } from "@/lib/payments";

export type CartLine = { productId: number; quantity: number };

export type CouponResult =
  | { ok: true; code: string; discount: number; label: string }
  | { ok: false; error: string };

async function findCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const t = await getT();
  const c = code.trim().toUpperCase();
  if (!c) return { ok: false, error: t("Enter a coupon code.") };
  const row = (await db.select().from(coupons).where(eq(coupons.code, c)).limit(1))[0];
  if (!row || !row.active) return { ok: false, error: t("This coupon is not valid.") };
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: t("This coupon has expired.") };
  }
  const discount =
    row.type === "percent" ? Math.floor((subtotal * row.value) / 100) : Math.min(row.value, subtotal);
  return {
    ok: true,
    code: row.code,
    discount,
    label: row.type === "percent" ? t("{v}% off", { v: row.value }) : t("Rs. {v} off", { v: row.value }),
  };
}

async function priceCart(lines: CartLine[]) {
  const t = await getT();
  const clean = lines
    .filter((l) => Number.isInteger(l.productId) && Number.isInteger(l.quantity) && l.quantity > 0)
    .slice(0, 30);
  if (clean.length === 0) return { error: t("Your cart is empty.") };
  const rows = await db
    .select()
    .from(products)
    .where(and(inArray(products.id, clean.map((l) => l.productId)), eq(products.active, true)));
  const items = [];
  for (const l of clean) {
    const p = rows.find((r) => r.id === l.productId);
    if (!p) return { error: t("A perfume in your cart is no longer available.") };
    if (p.stock < l.quantity) {
      return { error: t("Only {n} of {name} left in stock. Please update your cart.", { n: p.stock, name: p.name }) };
    }
    items.push({ product: p, quantity: l.quantity });
  }
  const subtotal = items.reduce((n, i) => n + i.product.price * i.quantity, 0);
  return { items, subtotal };
}

export async function applyCoupon(code: string, lines: CartLine[]): Promise<CouponResult> {
  const priced = await priceCart(lines);
  if ("error" in priced) return { ok: false, error: priced.error ?? "Cart problem." };
  return findCoupon(code, priced.subtotal);
}

export type PlaceOrderInput = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note: string;
  paymentMethod: string;
  coupon: string;
  lines: CartLine[];
};

export type PlaceOrderResult = { ok: true; orderNumber: string; next: string } | { ok: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const t = await getT();
  const name = input.name.trim().slice(0, 100);
  const phone = input.phone.replace(/[\s-]/g, "");
  const email = input.email.trim().slice(0, 120);
  const address = input.address.trim().slice(0, 300);
  const city = input.city.trim().slice(0, 60);
  const note = input.note.trim().slice(0, 300);

  if (name.length < 2) return { ok: false, error: t("Please enter your name.") };
  if (!/^(\+92|0)?3\d{9}$/.test(phone)) {
    return { ok: false, error: t("Enter a valid Pakistani mobile number, like 0300 1234567.") };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: t("That email address does not look right.") };
  }
  if (address.length < 8) return { ok: false, error: t("Please enter your full address.") };
  if (city.length < 2) return { ok: false, error: t("Please enter your city.") };
  const avail = availability();
  const method = input.paymentMethod as Method;
  if (!(method in avail)) return { ok: false, error: t("Choose a payment method.") };
  // The server decides what is on offer; a browser cannot switch on a gateway that has no credentials
  if (!avail[method]) return { ok: false, error: t("This payment method is not available yet. Please choose another.") };
  const payStatus = method === "cod" ? "unpaid" : "awaiting_payment";

  const priced = await priceCart(input.lines);
  if ("error" in priced) return { ok: false, error: priced.error ?? "Cart problem." };

  let discount = 0;
  let couponCode: string | null = null;
  if (input.coupon.trim()) {
    const c = await findCoupon(input.coupon, priced.subtotal);
    if (!c.ok) return { ok: false, error: c.error };
    discount = c.discount;
    couponCode = c.code;
  }
  const user = await getUser();
  const delivery = 0;
  const total = priced.subtotal - discount + delivery;
  // Random and long enough that nobody can guess another customer's order page
  const orderNumber = `HAAD-${Array.from(randomBytes(10), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("")}`;

  try {
    await db.transaction(async (tx) => {
      // Take stock first; the WHERE stops it from going below zero if two people buy at once
      for (const i of priced.items) {
        const res = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${i.quantity}` })
          .where(and(eq(products.id, i.product.id), gt(products.stock, i.quantity - 1)));
        if (res.rowsAffected === 0) throw new Error(`STOCK:${i.product.name}`);
      }
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId: user?.id ?? null,
          customerName: name,
          phone,
          email: email || null,
          address,
          city,
          note: note || null,
          subtotal: priced.subtotal,
          discount,
          delivery,
          total,
          paymentMethod: method,
          paymentStatus: payStatus,
          couponCode,
        })
        .returning({ id: orders.id });
      await tx.insert(paymentEvents).values({ orderId: order.id, fromStatus: null, toStatus: payStatus, actor: "system", note: `Order placed with ${methodLabel(method)}` });
      await tx.insert(orderItems).values(
        priced.items.map((i) => ({
          orderId: order.id,
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })),
      );
      if (couponCode) {
        await tx
          .update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(eq(coupons.code, couponCode));
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("STOCK:")) {
      return { ok: false, error: t("Sorry, {name} just went out of stock.", { name: msg.slice(6) }) };
    }
    console.error("placeOrder failed:", e);
    return { ok: false, error: t("Something went wrong. Please try again or message us on WhatsApp.") };
  }
  await sendOrderEmails({
    orderNumber,
    name,
    phone,
    email,
    address,
    city,
    note,
    payment: method,
    total,
    discount,
    items: priced.items.map((i) => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
  });
  await notifyShopWhatsApp(
    buildOrderText({
      orderNumber, name, phone, email, address, city, note, payment: method, discount, total, couponCode,
      items: priced.items.map((i) => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
    }),
  );
  return { ok: true, orderNumber, next: isGateway(method) ? `/pay/${method}/${orderNumber}` : `/order/${orderNumber}` };
}
