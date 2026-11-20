import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, paymentEvents } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { collectCod, rejectPayment, setOrderStatus, verifyPayment } from "./actions";
import { methodLabel, statusLabel } from "@/lib/payments";
import { buildOrderText, waDigits } from "@/lib/whatsapp-order";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default async function AdminOrders() {
  const list = await db.select().from(orders).orderBy(desc(orders.id)).limit(100);
  const items = list.length ? await db.select().from(orderItems) : [];
  const events = list.length ? await db.select().from(paymentEvents).orderBy(paymentEvents.id) : [];
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-[36px] font-medium leading-none md:text-[48px]">Orders</h1>
      {list.length === 0 && <p className="rounded border border-line bg-surface p-5 text-muted">No orders yet.</p>}
      {list.map((o) => (
        <article key={o.id} className="flex flex-col gap-3 rounded border border-line bg-surface p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong>{o.orderNumber}</strong>
            <span className="text-sm text-muted">{o.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Karachi" })}</span>
          </div>
          <div className="text-sm">
            <div>{o.customerName} · <a className="text-accent underline" href={`tel:${o.phone}`}>{o.phone}</a> · <a className="text-accent underline" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${waDigits(o.phone)}?text=${encodeURIComponent(buildOrderText({ orderNumber: o.orderNumber, name: o.customerName, phone: o.phone, email: o.email, address: o.address, city: o.city, note: o.note, payment: o.paymentMethod, discount: o.discount, total: o.total, couponCode: o.couponCode, items: items.filter((i) => i.orderId === o.id) }))}`}>WhatsApp</a>{o.email ? ` · ${o.email}` : ""}</div>
            <div className="text-muted">{o.address}, {o.city}</div>
            {o.note && <div className="text-muted">Note: {o.note}</div>}
          </div>
          <ul className="m-0 list-none p-0 text-sm">
            {items.filter((i) => i.orderId === o.id).map((i) => (
              <li key={i.id}>{i.name} × {i.quantity} — {formatPrice(i.price * i.quantity)}</li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <div>
              <strong>{formatPrice(o.total)}</strong>
              <span className="text-sm text-muted"> · {methodLabel(o.paymentMethod)}{o.couponCode ? ` · ${o.couponCode}` : ""}</span>
            </div>
            <form action={setOrderStatus} className="flex gap-2">
              <input type="hidden" name="id" value={o.id} />
              <select name="status" defaultValue={o.status} aria-label="Order status" className="min-h-11 rounded border border-line2 bg-surface px-3 capitalize text-ink">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="min-h-11 cursor-pointer rounded-sm border border-accent px-4 text-sm font-semibold uppercase text-accent">Save</button>
            </form>
          </div>
          <div className="flex flex-col gap-2 rounded border border-line p-3 text-sm" data-testid={`pay-${o.orderNumber}`}>
            <div className="flex flex-wrap items-center gap-3">
              <span>Payment: <strong>{methodLabel(o.paymentMethod)}</strong></span>
              <span className={`rounded-sm border px-2 py-1 text-xs uppercase tracking-[0.1em] ${o.paymentStatus === "paid" ? "border-green-400 text-green-300" : o.paymentStatus === "rejected" || o.paymentStatus === "failed" ? "border-red-400 text-red-300" : "border-accent text-accent"}`}>{statusLabel(o.paymentStatus)}</span>
              {o.paymentRef && <span className="text-muted">Reference: <span dir="ltr">{o.paymentRef}</span></span>}
              {o.paymentReceipt && (
                <a className="text-accent underline" target="_blank" rel="noopener noreferrer" href={`/admin/receipt/${o.paymentReceipt.replace(/^db:/, "")}`}>View receipt</a>
              )}
            </div>
            {(o.paymentStatus === "pending_verification" && ["bank_transfer", "easypaisa", "jazzcash"].includes(o.paymentMethod)) && (
              <form action={verifyPayment} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={o.id} />
                <input name="note" maxLength={200} placeholder="Note (optional)" aria-label="Payment note" className="min-h-11 min-w-0 flex-1 rounded border border-line2 bg-surface px-3 text-ink" />
                <button className="min-h-11 cursor-pointer rounded-sm border border-green-400 px-4 text-sm font-semibold uppercase text-green-300">Verify payment</button>
                <button formAction={rejectPayment} className="min-h-11 cursor-pointer rounded-sm border border-red-400 px-4 text-sm font-semibold uppercase text-red-300">Reject</button>
              </form>
            )}
            {o.paymentMethod === "cod" && o.paymentStatus === "unpaid" && (
              <form action={collectCod}>
                <input type="hidden" name="id" value={o.id} />
                <button className="min-h-11 cursor-pointer rounded-sm border border-accent px-4 text-sm font-semibold uppercase text-accent">Mark cash collected</button>
              </form>
            )}
            <details>
              <summary className="cursor-pointer text-muted">Payment history</summary>
              <ul className="m-0 mt-2 list-none p-0 text-xs text-muted">
                {events.filter((e) => e.orderId === o.id).map((e) => (
                  <li key={e.id}>{e.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Karachi" })} · {e.fromStatus ? `${e.fromStatus} → ` : ""}{e.toStatus} · {e.actor}{e.note ? ` · ${e.note}` : ""}</li>
                ))}
              </ul>
            </details>
          </div>
        </article>
      ))}
    </div>
  );
}
