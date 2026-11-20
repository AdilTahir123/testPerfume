import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getT } from "@/lib/lang";
import { formatPrice } from "@/lib/format";
import { ORDER_WHATSAPP, buildOrderText } from "@/lib/whatsapp-order";
import { bankDetails, isGateway, methodLabel, statusLabel } from "@/lib/payments";
import BankProofForm from "./BankProofForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order received | HAAD Fragrances", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const t = await getT();
  const { number } = await params;
  const order = (await db.select().from(orders).where(eq(orders.orderNumber, number)).limit(1))[0];
  if (!order) notFound();
  const bank = bankDetails();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  const waText = buildOrderText({
    orderNumber: order.orderNumber, name: order.customerName, phone: order.phone, email: order.email, address: order.address, city: order.city,
    note: order.note, payment: order.paymentMethod, discount: order.discount, total: order.total, couponCode: order.couponCode,
    items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
  });

  return (
    <section className="mx-auto flex max-w-[720px] flex-col gap-6 px-5 py-10 md:px-10 md:py-16">
      <div className="font-brand text-[11px] uppercase tracking-[0.22em] text-accent">{t("Order received")}</div>
      <h1 className="font-display text-[40px] font-medium leading-[1.05] md:text-[52px]">{t("Thank you, {name}", { name: order.customerName.split(" ")[0] })}</h1>
      <p className="m-0 text-muted">
        {t("Your order number is")} <strong className="text-ink" dir="ltr">{order.orderNumber}</strong>{t(". We will call or message you on {phone} to confirm.", { phone: order.phone })}
        {order.paymentMethod === "cod" && t(" You pay in cash when the parcel arrives.")}
      </p>
      <div className="flex flex-wrap items-center gap-3 rounded border border-line bg-surface p-4 text-sm" data-testid="payment-box">
        <span><span className="text-muted">{t("Payment")}: </span>{t(methodLabel(order.paymentMethod))}</span>
        <span className="rounded-sm border border-accent px-2 py-1 text-xs uppercase tracking-[0.1em] text-accent" data-testid="payment-status">{t(statusLabel(order.paymentStatus))}</span>
        {order.paymentStatus === "rejected" && <span className="text-red-300">{t("We could not verify your payment. Please send the details again or contact us.")}</span>}
      </div>
      {isGateway(order.paymentMethod) && ["awaiting_payment", "failed"].includes(order.paymentStatus) && (
        <Link href={`/pay/${order.paymentMethod}/${order.orderNumber}`} className="bg-gold flex min-h-12 w-fit items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">{t("Pay now")}</Link>
      )}
      {isGateway(order.paymentMethod) && order.paymentStatus === "pending_verification" && <p className="m-0 text-muted">{t("We are confirming your online payment. This is done by our team, so it may take a little while.")}</p>}
      {order.paymentMethod === "bank_transfer" && order.paymentStatus !== "paid" && (
        <>
          {bank && (
            <div className="flex flex-col gap-1 rounded border border-line bg-surface p-5 text-sm" data-testid="bank-details">
              <h2 className="m-0 mb-2 font-display text-2xl font-medium">{t("Pay to this bank account")}</h2>
              <span><span className="text-muted">{t("Bank")}: </span>{bank.bank}</span>
              <span><span className="text-muted">{t("Account title")}: </span>{bank.title}</span>
              {bank.account && <span><span className="text-muted">{t("Account number")}: </span><span dir="ltr">{bank.account}</span></span>}
              {bank.iban && <span><span className="text-muted">IBAN: </span><span dir="ltr">{bank.iban}</span></span>}
              <span className="text-muted">{t("Amount")}: {formatPrice(order.total)} · {t("Use this reference")}: <span dir="ltr">{order.orderNumber}</span></span>
            </div>
          )}
          <BankProofForm number={order.orderNumber} current={order.paymentRef ?? ""} />
        </>
      )}
      <div className="flex flex-col gap-3 rounded border border-line bg-surface p-5">
        {items.map((i) => (
          <div key={i.id} className="flex justify-between gap-3"><span>{i.name} × {i.quantity}</span><span>{formatPrice(i.price * i.quantity)}</span></div>
        ))}
        {order.discount > 0 && <div className="flex justify-between text-muted"><span>{t("Discount ({code})", { code: order.couponCode ?? "" })}</span><span>− {formatPrice(order.discount)}</span></div>}
        <div className="flex justify-between border-t border-line pt-3 text-lg font-medium"><span>{t("Total")}</span><span>{formatPrice(order.total)}</span></div>
        <div className="text-sm text-muted">{t("Deliver to: {address}, {city}", { address: order.address, city: order.city })}</div>
      </div>
      <a href={`https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer" className="flex min-h-12 w-fit items-center rounded-sm border border-accent px-8 text-sm font-semibold uppercase tracking-[0.08em] text-accent">{t("Send this order on WhatsApp")}</a>
      <Link href="/shop" className="bg-gold flex min-h-12 w-fit items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">{t("Continue shopping")}</Link>
    </section>
  );
}
