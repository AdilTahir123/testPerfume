"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orders, paymentReceipts } from "@/db/schema";
import { getT } from "@/lib/lang";
import { changePaymentStatus } from "@/lib/payments";
import { checkReceipt } from "@/lib/receipt";
import { notifyShopWhatsApp } from "@/lib/whatsapp-order";

export type ProofState = { ok?: boolean; error?: string };

// Customer sends the bank transaction reference (and optionally a receipt). The order only moves to
// "Pending verification": it is NEVER marked paid here. An admin has to check the bank and verify it.
export async function submitBankProof(number: string, _prev: ProofState, f: FormData): Promise<ProofState> {
  const t = await getT();
  const order = (await db.select().from(orders).where(eq(orders.orderNumber, number)).limit(1))[0];
  if (!order || order.paymentMethod !== "bank_transfer") return { error: t("Something went wrong. Please try again or message us on WhatsApp.") };
  if (!["awaiting_payment", "rejected", "pending_verification"].includes(order.paymentStatus)) {
    return { error: t("This order's payment has already been settled.") };
  }
  const ref = String(f.get("reference") ?? "").trim().slice(0, 40);
  if (!/^[A-Za-z0-9][A-Za-z0-9 \-_/.]{3,39}$/.test(ref)) {
    return { error: t("Enter the transaction reference from your bank (4 to 40 letters or numbers).") };
  }
  let receipt: string | undefined;
  const file = f.get("receipt");
  if (file instanceof File && file.size > 0) {
    const r = await checkReceipt(file);
    if ("error" in r) return { error: t(r.error) };
    const [row] = await db.insert(paymentReceipts).values({ orderId: order.id, mime: r.type, size: r.buf.length, data: r.buf }).returning({ id: paymentReceipts.id });
    receipt = `db:${row.id}`;
  }
  const changed = await changePaymentStatus(
    order.id,
    ["awaiting_payment", "rejected", "pending_verification"],
    "pending_verification",
    "customer",
    receipt ? `Customer submitted reference ${ref} and a receipt` : `Customer submitted reference ${ref}`,
    { paymentRef: ref, ...(receipt ? { paymentReceipt: receipt } : {}) },
  );
  if (!changed) return { error: t("This order's payment has already been settled.") };
  await notifyShopWhatsApp(`Bank transfer proof submitted for ${order.orderNumber}: Rs. ${order.total.toLocaleString("en-US")}, reference ${ref}${receipt ? ", receipt uploaded" : ""}. Please verify in the admin.`);
  revalidatePath(`/order/${number}`);
  return { ok: true };
}
