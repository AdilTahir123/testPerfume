import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { changePaymentStatus, logEvent } from "@/lib/payments";
import { inquireJazzCash, verifyJazzCashResponse } from "@/lib/jazzcash";
import { siteUrl } from "@/lib/site";
import { notifyShopWhatsApp } from "@/lib/whatsapp-order";

export const dynamic = "force-dynamic";

const back = (n?: string) => Response.redirect(`${siteUrl}${n ? `/order/${n}` : "/"}`, 303);

// JazzCash sends the customer back here with a signed POST. The browser arriving is NOT proof of payment:
// we check the signature with our secret salt, the amount and the reference on the server, and only then mark the order paid.
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return back();
  const f: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string" && (k.startsWith("pp_") || k.startsWith("ppmpf_"))) f[k] = v.slice(0, 500);
  const ref = f.pp_TxnRefNo;
  if (!ref) return back();
  const order = (await db.select().from(orders).where(eq(orders.gatewayTxnId, ref)).limit(1))[0];
  if (!order || order.paymentMethod !== "jazzcash") return back();

  if (!verifyJazzCashResponse(f)) {
    await logEvent(order.id, order.paymentStatus, "gateway:jazzcash", "Rejected a callback with an invalid signature");
    return back(order.orderNumber);
  }
  if (f.pp_Amount !== String(order.total * 100)) {
    await logEvent(order.id, order.paymentStatus, "gateway:jazzcash", `Rejected a callback: amount ${f.pp_Amount} does not match the order`);
    return back(order.orderNumber);
  }
  if (f.pp_ResponseCode === "000") {
    // The signed callback only tells us to check: JazzCash itself must confirm the payment server-to-server.
    const verdict = await inquireJazzCash(ref, String(order.total * 100));
    if (verdict === "paid") {
      const done = await changePaymentStatus(order.id, ["awaiting_payment", "failed", "pending_verification"], "paid", "gateway:jazzcash", `Verified with JazzCash (server check, ref ${ref})`);
      if (done) await notifyShopWhatsApp(`Payment received (JazzCash) for order ${order.orderNumber}: Rs. ${order.total.toLocaleString("en-US")}`);
    } else if (verdict === "failed") {
      await changePaymentStatus(order.id, ["awaiting_payment"], "failed", "gateway:jazzcash", "JazzCash server check says the payment did not go through");
    } else {
      await changePaymentStatus(order.id, ["awaiting_payment", "failed"], "pending_verification", "gateway:jazzcash", "Callback was signed but JazzCash could not confirm it server-to-server. Admin must check the JazzCash portal.");
    }
  } else {
    await changePaymentStatus(order.id, ["awaiting_payment"], "failed", "gateway:jazzcash", `JazzCash response ${f.pp_ResponseCode ?? "?"}: ${(f.pp_ResponseMessage ?? "").slice(0, 120)}`);
  }
  return back(order.orderNumber);
}

export async function GET() {
  return back();
}
