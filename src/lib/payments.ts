// Payment configuration. Everything comes from environment variables; nothing is hard-coded and no secret ever reaches the browser
// (only the functions below run on the server, and the checkout page receives plain true/false flags plus the public bank details).
import { db } from "@/db";
import { orders, paymentEvents } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export type Method = "cod" | "bank_transfer" | "jazzcash" | "easypaisa";
export const METHODS: Method[] = ["jazzcash", "easypaisa", "bank_transfer", "cod"];

export const methodLabel = (m: string) =>
  ({ cod: "Cash on delivery", bank_transfer: "Meezan Bank transfer", jazzcash: "JazzCash", easypaisa: "Easypaisa" } as Record<string, string>)[m] ?? m;

export const statusLabel = (s: string) =>
  ({
    unpaid: "Unpaid (pay on delivery)",
    awaiting_payment: "Awaiting payment",
    pending_verification: "Pending verification",
    paid: "Paid",
    rejected: "Rejected",
    failed: "Failed",
  } as Record<string, string>)[s] ?? s;

const env = (k: string) => (process.env[k] ?? "").trim();

export type BankDetails = { bank: string; title: string; account: string; iban: string };
// Bank details come from environment variables only. If they are not filled in, bank transfer is switched off.
export function bankDetails(): BankDetails | null {
  const title = env("BANK_ACCOUNT_TITLE");
  const account = env("BANK_ACCOUNT_NUMBER");
  const iban = env("BANK_IBAN");
  if (!title || (!account && !iban)) return null;
  return { bank: env("BANK_NAME") || "Meezan Bank", title, account, iban };
}

export function jazzcashConfig() {
  const merchantId = env("JAZZCASH_MERCHANT_ID");
  const password = env("JAZZCASH_PASSWORD");
  const salt = env("JAZZCASH_INTEGRITY_SALT");
  if (!merchantId || !password || !salt) return null;
  return { merchantId, password, salt, live: env("JAZZCASH_MODE") === "live" };
}

export function easypaisaConfig() {
  const storeId = env("EASYPAISA_STORE_ID");
  const hashKey = env("EASYPAISA_HASH_KEY");
  if (!storeId || !hashKey) return null;
  return { storeId, hashKey, live: env("EASYPAISA_MODE") === "live" };
}

// What the checkout may offer. Gateways stay off until the official merchant credentials are in .env.
export function availability(): Record<Method, boolean> {
  return { cod: true, bank_transfer: !!bankDetails(), jazzcash: !!jazzcashConfig(), easypaisa: !!easypaisaConfig() };
}

export const isGateway = (m: string) => m === "jazzcash" || m === "easypaisa";

// Moves an order's payment status only if it is currently one of `from` (so a repeated callback or double click does nothing)
// and writes the history row. Returns true if this call made the change.
export async function changePaymentStatus(
  orderId: number,
  from: string[],
  to: string,
  actor: string,
  note: string,
  extra: Partial<{ paymentRef: string; paymentReceipt: string; paidAt: Date }> = {},
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const cur = (await tx.select({ s: orders.paymentStatus }).from(orders).where(eq(orders.id, orderId)).limit(1))[0];
    if (!cur) return false;
    const res = await tx
      .update(orders)
      .set({ paymentStatus: to, ...(to === "paid" ? { paidAt: new Date() } : {}), ...extra })
      .where(and(eq(orders.id, orderId), inArray(orders.paymentStatus, from)));
    if (res.rowsAffected === 0) return false;
    await tx.insert(paymentEvents).values({ orderId, fromStatus: cur.s, toStatus: to, actor, note: note.slice(0, 300) });
    return true;
  });
}

export async function logEvent(orderId: number, status: string, actor: string, note: string) {
  await db.insert(paymentEvents).values({ orderId, fromStatus: status, toStatus: status, actor, note: note.slice(0, 300) });
}
