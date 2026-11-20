import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { getT } from "@/lib/lang";
import { formatPrice } from "@/lib/format";
import { logout } from "../login/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My account | HAAD Fragrances" };

export default async function AccountPage() {
  const t = await getT();
  const user = await getUser();
  if (!user) redirect("/login?next=/account");
  const mine = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.id));
  return (
    <section className="mx-auto flex max-w-[800px] flex-col gap-6 px-5 py-10 md:px-10 md:py-14">
      <h1 className="font-display text-[40px] font-medium leading-[1.05] md:text-[52px]">{t("Hello, {name}", { name: user.name.split(" ")[0] })}</h1>
      <p className="m-0 text-muted">{user.email}</p>
      <div className="flex flex-wrap gap-3">
        {user.role === "admin" && <Link href="/admin" className="bg-gold flex min-h-11 items-center rounded-sm px-6 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">{t("Admin dashboard")}</Link>}
        <form action={logout}><button className="min-h-11 cursor-pointer rounded-sm border border-line2 px-6 text-sm uppercase tracking-[0.08em] text-ink">{t("Log out")}</button></form>
      </div>
      <h2 className="font-display text-2xl font-medium">{t("My orders")}</h2>
      {mine.length === 0 ? (
        <p className="rounded border border-line bg-surface p-5 text-muted">{t("No orders yet.")}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {mine.map((o) => (
            <li key={o.id} className="flex flex-wrap justify-between gap-2 rounded border border-line bg-surface p-4">
              <Link href={`/order/${o.orderNumber}`} dir="ltr" className="text-accent underline">{o.orderNumber}</Link>
              <span className="text-muted">{t(o.status)}</span>
              <span>{formatPrice(o.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
