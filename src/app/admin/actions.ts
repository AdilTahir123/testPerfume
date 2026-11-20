"use server";

import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { eq, sql } from "drizzle-orm";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { coupons, orderItems, orders, products, reviews } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { changePaymentStatus } from "@/lib/payments";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function setOrderStatus(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const status = String(f.get("status"));
  if (!Number.isInteger(id) || !STATUSES.includes(status)) return;
  const cur = (await db.select({ status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1))[0];
  if (!cur || cur.status === status || cur.status === "cancelled") return; // a cancelled order stays cancelled (its stock was already returned)
  await db.transaction(async (tx) => {
    await tx.update(orders).set({ status }).where(eq(orders.id, id));
    if (status === "cancelled") {
      // put the reserved bottles back on the shelf
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
      for (const i of items) if (i.productId) await tx.update(products).set({ stock: sql`${products.stock} + ${i.quantity}` }).where(eq(products.id, i.productId));
    }
  });
  revalidatePath("/admin");
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

async function saveImage(file: File): Promise<string | { error: string }> {
  const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[file.type];
  if (!ext) return { error: "Image must be JPG, PNG or WebP." };
  if (file.size > 5 * 1024 * 1024) return { error: "Image must be under 5 MB." };
  // Check the real file contents, not only the type the browser claims
  const head = Buffer.from(await file.slice(0, 12).arrayBuffer());
  const isPng = head.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const isJpg = head.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  const isWebp = head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP";
  if (!isPng && !isJpg && !isWebp) return { error: "This file is not a real image." };
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  // On the live site photos go to Vercel Blob (permanent). On your own computer they go to the uploads folder.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`products/${name}`, file, { access: "public", contentType: file.type });
      return blob.url;
    } catch (e) {
      console.error("Blob upload failed:", e);
      return { error: "Photo upload failed. Please try again." };
    }
  }
  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export type SaveState = { error?: string };

export async function saveProduct(_: SaveState, f: FormData): Promise<SaveState> {
  await requireAdmin();
  const id = Number(f.get("id")) || 0;
  const name = String(f.get("name") ?? "").trim().slice(0, 120);
  const slug = slugify(String(f.get("slug") ?? "") || name);
  const tag = String(f.get("tag"));
  const price = Math.round(Number(f.get("price")));
  const stock = Math.round(Number(f.get("stock")));
  const sizeMl = Math.round(Number(f.get("sizeMl"))) || 50;
  if (name.length < 2) return { error: "Enter the perfume name." };
  if (!slug) return { error: "Slug could not be made from the name." };
  if (!["For him", "For her", "Unisex"].includes(tag)) return { error: "Choose For him, For her or Unisex." };
  if (!(price > 0)) return { error: "Enter a price in rupees." };
  if (!(stock >= 0)) return { error: "Stock cannot be negative." };

  const clash = (await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1))[0];
  if (clash && clash.id !== id) return { error: "Another perfume already uses this slug. Change the name or slug." };

  let image = String(f.get("imageUrl") ?? "").trim();
  const file = f.get("imageFile");
  if (file instanceof File && file.size > 0) {
    const r = await saveImage(file);
    if (typeof r !== "string") return r;
    image = r;
  }
  if (!image) {
    if (id) image = (await db.select().from(products).where(eq(products.id, id)).limit(1))[0]?.image ?? "";
    if (!image) return { error: "Please upload a photo." };
  }
  if (!image.startsWith("/") && !/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(image)) {
    return { error: "Please upload the photo as a file." };
  }

  const values = {
    slug,
    name,
    tag,
    description: String(f.get("description") ?? "").trim().slice(0, 1500),
    price,
    stock,
    sizeMl,
    image,
    imageAlt: String(f.get("imageAlt") ?? "").trim().slice(0, 200) || name,
    topNotes: String(f.get("topNotes") ?? "").trim().slice(0, 120),
    heartNotes: String(f.get("heartNotes") ?? "").trim().slice(0, 120),
    baseNotes: String(f.get("baseNotes") ?? "").trim().slice(0, 120),
    featured: f.get("featured") === "on",
    active: f.get("active") === "on",
  };
  if (values.featured) await db.update(products).set({ featured: false });
  if (id) await db.update(products).set(values).where(eq(products.id, id));
  else await db.insert(products).values(values);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function toggleProduct(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const p = (await db.select().from(products).where(eq(products.id, id)).limit(1))[0];
  if (!p) return;
  await db.update(products).set({ active: !p.active }).where(eq(products.id, id));
  revalidatePath("/", "layout");
}

export async function saveCoupon(f: FormData) {
  await requireAdmin();
  const code = String(f.get("code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
  const type = f.get("type") === "fixed" ? "fixed" : "percent";
  const value = Math.round(Number(f.get("value")));
  if (!code || !(value > 0) || (type === "percent" && value > 100)) return;
  await db
    .insert(coupons)
    .values({ code, type, value })
    .onConflictDoUpdate({ target: coupons.code, set: { type, value, active: true } });
  revalidatePath("/admin/coupons");
}

export async function toggleCoupon(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const c = (await db.select().from(coupons).where(eq(coupons.id, id)).limit(1))[0];
  if (!c) return;
  await db.update(coupons).set({ active: !c.active }).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function reviewAction(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  if (!Number.isInteger(id)) return;
  const act = f.get("do");
  if (act !== "approve" && act !== "delete") return;
  if (act === "approve") await db.update(reviews).set({ approved: true }).where(eq(reviews.id, id));
  else await db.delete(reviews).where(eq(reviews.id, id));
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}

// Payment decisions. Only an admin can do these, only from the allowed current states, and every change is logged.
async function reviewPaymentAs(decision: string, f: FormData) {
  const admin = await requireAdmin();
  const id = Number(f.get("id"));
  const note = String(f.get("note") ?? "").trim().slice(0, 200);
  if (!Number.isInteger(id)) return;
  const order = (await db.select().from(orders).where(eq(orders.id, id)).limit(1))[0];
  if (!order) return;
  const actor = `admin:${admin.email}`;
  if (decision === "verify" && ["bank_transfer", "easypaisa", "jazzcash"].includes(order.paymentMethod)) {
    await changePaymentStatus(id, ["pending_verification"], "paid", actor, note || "Payment verified by admin");
  } else if (decision === "reject" && ["bank_transfer", "easypaisa", "jazzcash"].includes(order.paymentMethod)) {
    await changePaymentStatus(id, ["pending_verification"], "rejected", actor, note || "Payment rejected by admin");
  } else if (decision === "cod_paid" && order.paymentMethod === "cod") {
    await changePaymentStatus(id, ["unpaid"], "paid", actor, note || "Cash collected on delivery");
  }
  revalidatePath("/admin");
}

// One action per button (a button's own name/value is not reliably sent with form actions, so the decision is fixed in the action).
export async function verifyPayment(f: FormData) {
  await requireAdmin();
  await reviewPaymentAs("verify", f);
}
export async function rejectPayment(f: FormData) {
  await requireAdmin();
  await reviewPaymentAs("reject", f);
}
export async function collectCod(f: FormData) {
  await requireAdmin();
  await reviewPaymentAs("cod_paid", f);
}
