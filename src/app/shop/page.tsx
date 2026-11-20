import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/lang";
import ProductCard from "@/components/ProductCard";
import { TAGS, searchProducts, type Sort } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop | HAAD Fragrances",
  description: "Browse all HAAD perfumes for men and women.",
};

type Props = { searchParams: Promise<{ q?: string; tag?: string; sort?: string }> };

const field =
  "min-h-11 w-full rounded border border-line2 bg-surface px-3 text-base text-ink";

export default async function ShopPage({ searchParams }: Props) {
  const t = await getT();
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const tag = (TAGS as readonly string[]).includes(sp.tag ?? "") ? sp.tag! : "";
  const sort: Sort =
    sp.sort === "price-asc" || sp.sort === "price-desc" ? sp.sort : "newest";

  const list = await searchProducts({ q, tag, sort });
  const filtered = q !== "" || tag !== "" || sort !== "newest";

  return (
    <section className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-8 md:px-10 md:py-12">
      <div className="flex flex-col gap-2.5">
        <div className="font-brand text-[10px] uppercase tracking-[0.22em] text-accent md:text-[11px]">
          {t("The collection")}
        </div>
        <h1 className="font-display text-[40px] font-medium leading-[1.05] md:text-[56px]">
          {t("All perfumes")}
        </h1>
      </div>

      {/* A plain form, so search and filters also work without JavaScript */}
      <form method="get" action="/shop" role="search" className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="q" className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted">{t("Search")}</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder={t("Perfume name")} className={field} />
        </div>
        <div>
          <label htmlFor="tag" className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted">{t("For")}</label>
          <select id="tag" name="tag" defaultValue={tag} className={field}>
            <option value="">{t("Everyone")}</option>
            {TAGS.map((tg) => (
              <option key={tg} value={tg}>{t(tg)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted">{t("Sort by")}</label>
          <select id="sort" name="sort" defaultValue={sort} className={field}>
            <option value="newest">{t("Newest")}</option>
            <option value="price-asc">{t("Price: low to high")}</option>
            <option value="price-desc">{t("Price: high to low")}</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <button type="submit" className="bg-gold min-h-11 cursor-pointer rounded-sm px-6 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">
            {t("Apply")}
          </button>
          {filtered && (
            <Link href="/shop" className="flex min-h-11 items-center text-sm text-accent underline">
              {t("Clear")}
            </Link>
          )}
        </div>
      </form>

      <p className="text-sm text-muted" role="status">
        {t(list.length === 1 ? "{n} perfume" : "{n} perfumes", { n: list.length })}
        {filtered ? t(" found") : ""}
      </p>

      {list.length === 0 ? (
        <div className="rounded border border-line bg-surface p-6 text-muted">
          {t("No perfumes match your search.")} <Link href="/shop" className="text-accent underline">{t("Show all")}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
