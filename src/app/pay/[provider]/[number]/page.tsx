import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { changePaymentStatus } from "@/lib/payments";
import { buildJazzCashRequest } from "@/lib/jazzcash";
import { buildEasypaisaRequest } from "@/lib/easypaisa";
import AutoSubmit from "./AutoSubmit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Redirecting to payment | HAAD Fragrances", robots: { index: false } };

// Starts an online payment for an existing order. The price always comes from the saved order, never from the browser.
export default async function PayPage({ params }: { params: Promise<{ provider: string; number: string }> }) {
  const { provider, number } = await params;
  if (provider !== "jazzcash" && provider !== "easypaisa") notFound();
  const order = (await db.select().from(orders).where(eq(orders.orderNumber, number)).limit(1))[0];
  if (!order || order.paymentMethod !== provider) notFound();
  if (order.paymentStatus === "failed") await changePaymentStatus(order.id, ["failed"], "awaiting_payment", "customer", "Customer retried payment");
  else if (order.paymentStatus !== "awaiting_payment") redirect(`/order/${number}`);

  // A fresh transaction reference only when there is none yet or the last attempt failed
  let txnRef = order.gatewayTxnId;
  if (!txnRef || order.paymentStatus === "failed") {
    txnRef = `T${Date.now().toString(36).toUpperCase()}${randomBytes(4).toString("hex").toUpperCase()}`;
    await db.update(orders).set({ gatewayTxnId: txnRef }).where(eq(orders.id, order.id));
  }
  const req =
    provider === "jazzcash"
      ? buildJazzCashRequest({ orderNumber: order.orderNumber, txnRef, total: order.total })
      : buildEasypaisaRequest({ orderNumber: order.orderNumber, txnRef, total: order.total, email: order.email ?? "", phone: order.phone });
  if (!req) redirect(`/order/${number}`); // gateway not configured
  return <AutoSubmit action={req.action} fields={req.fields} />;
}
