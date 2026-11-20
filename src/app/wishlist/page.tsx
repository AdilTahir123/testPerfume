import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, wishlist } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { getT } from "@/lib/lang";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wishlist | HAAD Fragrances" };

export default async function WishlistPage() {
  const t = await getT();
  const user = await getUser();
  if (!user) redirect("/login?next=/wishlist");
  const rows = await db
    .select({ p: products })
    .from(wishlist)
    .innerJoin(products, eq(products.id, wishlist.productId))
    .where(and(eq(wishlist.userId, user.id), eq(products.active, true)))
    .orderBy(desc(wishlist.id));
  return (
    <section className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-[40px] font-medium leading-[1.05] md:text-[56px]">{t("Your wishlist")}</h1>
      {rows.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded border border-line bg-surface p-6">
          <p className="m-0 text-muted">{t("Tap the heart on any perfume to save it here.")}</p>
          <Link href="/shop" className="bg-gold flex min-h-12 items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">{t("Browse perfumes")}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {rows.map(({ p }) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}
