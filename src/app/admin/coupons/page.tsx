import { desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { saveCoupon, toggleCoupon } from "../actions";

const field = "min-h-11 rounded border border-line2 bg-surface px-3 text-base text-ink";

export default async function AdminCoupons() {
  const list = await db.select().from(coupons).orderBy(desc(coupons.id));
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-[36px] font-medium leading-none md:text-[48px]">Coupons</h1>
      <form action={saveCoupon} className="flex flex-wrap items-end gap-3 rounded border border-line bg-surface p-4">
        <div><label htmlFor="code" className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted">Code</label><input id="code" name="code" required placeholder="EID20" className={`${field} uppercase`} /></div>
        <div><label htmlFor="type" className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted">Type</label><select id="type" name="type" className={field}><option value="percent">Percent off</option><option value="fixed">Rupees off</option></select></div>
        <div><label htmlFor="value" className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted">Value</label><input id="value" name="value" type="number" min={1} required className={`${field} w-28`} /></div>
        <button className="bg-gold min-h-11 cursor-pointer rounded-sm px-6 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">Add / update</button>
      </form>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {list.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-surface p-3">
            <div><strong>{c.code}</strong> <span className="text-muted">· {c.type === "percent" ? `${c.value}% off` : `Rs. ${c.value} off`} · used {c.usedCount}× · {c.active ? "active" : "off"}</span></div>
            <form action={toggleCoupon}><input type="hidden" name="id" value={c.id} /><button className="min-h-11 cursor-pointer rounded-sm border border-line2 px-4 text-sm text-muted">{c.active ? "Turn off" : "Turn on"}</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
