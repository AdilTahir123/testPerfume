import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { changePaymentStatus, logEvent } from "@/lib/payments";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const back = (n?: string) => Response.redirect(`${siteUrl}${n ? `/order/${n}` : "/"}`, 303);

// Easypaisa brings the customer back here. A browser arriving is NOT proof of payment, and the official server-to-server
// confirmation is not wired up yet, so we never mark the order paid here. It becomes "Pending verification" and an admin
// confirms it against the Easypaisa merchant portal.
async function handle(params: URLSearchParams) {
  const ref = params.get("orderRefNumber") || params.get("orderRefNum") || "";
  if (!ref) return back();
  const order = (await db.select().from(orders).where(eq(orders.gatewayTxnId, ref)).limit(1))[0];
  if (!order || order.paymentMethod !== "easypaisa") return back();
  const status = params.get("status") || params.get("desc") || "";
  await changePaymentStatus(order.id, ["awaiting_payment", "failed"], "pending_verification", "gateway:easypaisa", `Customer returned from Easypaisa (${status.slice(0, 80) || "no status"}). Not auto-confirmed.`, { paymentRef: ref });
  await logEvent(order.id, "pending_verification", "gateway:easypaisa", "Awaiting admin confirmation in the Easypaisa merchant portal");
  return back(order.orderNumber);
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const p = new URLSearchParams();
  if (form) for (const [k, v] of form.entries()) if (typeof v === "string") p.set(k, v.slice(0, 300));
  return handle(p);
}
export async function GET(req: Request) {
  return handle(new URL(req.url).searchParams);
}
