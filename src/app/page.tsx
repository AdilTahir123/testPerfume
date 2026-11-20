import Image from "next/image";
import Link from "next/link";
import FeaturedBottle from "@/components/FeaturedBottle";
import { whatsappLink } from "@/lib/site";
import { getT } from "@/lib/lang";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import ProductCard from "@/components/ProductCard";
import { formatPrice } from "@/lib/format";
import { getActiveProducts, getFeaturedProduct, getLatestReviews } from "@/lib/queries";

// Always read fresh products, so changes in the dashboard show up at once.
export const dynamic = "force-dynamic";

const wrap = "mx-auto max-w-[1200px] px-5 md:px-10";
const eyebrow =
  "font-brand text-[10px] uppercase tracking-[0.22em] text-accent md:text-[11px]";
const h2 =
  "font-display text-[38px] font-medium leading-[1.05] md:text-[clamp(36px,4.4vw,56px)]";
const goldBtn =
  "bg-gold flex min-h-[52px] items-center justify-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc";
const outlineBtn =
  "flex min-h-[52px] items-center justify-center rounded-sm border border-line2 px-8 text-sm font-medium uppercase tracking-[0.08em] text-ink";

export default async function Home() {
  const t = await getT();
  const products = await getActiveProducts();
  const latestReviews = await getLatestReviews(3);
  const featured = await getFeaturedProduct(products);

  return (
    <>
      {/* Hero */}
      <section id="top" className={`${wrap} flex flex-wrap items-center gap-10 pb-12 pt-4 md:pb-16`}>
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5 md:gap-6">
          <div className={eyebrow}>Haad Fragrances · 50ml</div>
          <h1 className="font-display text-[48px] font-medium leading-[1.03] [text-wrap:balance] md:text-[clamp(48px,6.4vw,90px)] md:leading-[1.02]">
            {t("A scent people remember after you leave.")}
          </h1>
          <p className="max-w-[460px] text-base text-muted md:text-lg">
            {t("Rich, long-lasting fragrance at a fair price. Delivered free to your door, and you can pay when it arrives.")}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/shop" className={`${goldBtn} max-md:w-full`}>{t("Shop perfumes")}</Link>
            <Link href="/#story" className={`${outlineBtn} max-md:hidden`}>{t("Our story")}</Link>
          </div>
        </div>
        <div className="flex min-w-0 flex-[1_1_380px] justify-center">
          <div className="relative aspect-[4/5] w-full max-w-[460px] overflow-hidden rounded border border-line2 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <Image
              src="/images/sample-queen.jpg"
              alt={t("Red and gold perfume bottle resting on golden sand")}
              fill
              priority
              sizes="(min-width: 768px) 460px, 100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.35) 100%)" }} />
          </div>
        </div>
      </section>

      <div className="h-0.5" style={{ background: "linear-gradient(90deg, transparent, #B8692F 20%, #F2C27A 50%, #B8692F 80%, transparent)" }} />

      {/* Featured bottle */}
      {featured && (
      <section id="feature" className={`${wrap} flex flex-wrap items-center gap-8 pb-6 pt-14 md:gap-12 md:pt-20`}>
        <FeaturedBottle image={featured.image} alt={featured.imageAlt} />
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
          <div className={eyebrow}>{t("Featured")}</div>
          <h2 className={h2}>
            <Link href={`/product/${featured.slug}`} className="hover:text-accent">{featured.name}</Link>
          </h2>
          <p className="max-w-[440px] text-base text-muted md:text-lg">{featured.description}</p>
          <div className="grid grid-cols-3 gap-3 py-2">
            {[
              ["top", featured.topNotes],
              ["heart", featured.heartNotes],
              ["base", featured.baseNotes],
            ].map(([k, v]) => (
              <div key={k} className="border-t border-line2 pt-2.5">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">{t(k)}</div>
                <div className="text-sm md:text-base">{v}</div>
              </div>
            ))}
          </div>
          <div className="text-[22px] font-medium md:text-[26px]">
            {formatPrice(featured.price)}{" "}
            <span className="text-sm font-normal text-muted md:text-[15px]">· {featured.sizeMl}ml · {t("Free delivery")}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <AddToCartButton product={featured} className={`${goldBtn} cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 max-md:w-full`} />
            <div className="max-md:hidden"><WishlistButton productId={featured.id} name={featured.name} full /></div>
          </div>
        </div>
      </section>
      )}

      {/* Trust strip */}
      <section aria-label={t("Why HAAD")} className="mt-12 border-y border-line bg-band md:mt-[72px]">
        <div className={`${wrap} grid grid-cols-2 gap-4 py-5 md:flex md:flex-wrap md:justify-between md:gap-x-10 md:py-7`}>
          {[
            [t("Free delivery"), t("Anywhere in Pakistan")],
            [t("Cash on delivery"), t("Pay when it arrives")],
            [t("Bank transfer"), t("Easy and secure")],
            [t("WhatsApp support"), t("Ask us anything")],
          ].map(([t, s]) => (
            <div key={t} className="min-w-0 md:flex-[1_1_200px]">
              <div className="text-[15px] font-semibold md:text-base">{t}</div>
              <div className="text-[13px] text-muted md:text-[15px]">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="shop" className={`${wrap} flex flex-col gap-6 pb-2 pt-12 md:gap-10 md:pt-[88px]`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2.5">
            <div className={eyebrow}>{t("The collection")}</div>
            <h2 className={h2}>{t("Our perfumes")}</h2>
          </div>
          <Link href="/shop" className="flex min-h-11 items-center text-sm uppercase tracking-[0.08em] text-accent max-md:hidden">
            {t("View all")}
          </Link>
        </div>
        {products.length === 0 && (
          <p className="rounded border border-line bg-surface p-6 text-muted">
            {t("No perfumes yet. Please check back soon.")}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
          {products.map((p, i) => (
            <div key={p.slug} className={i === products.length - 1 && products.length % 2 === 1 ? "col-span-2 md:col-span-1" : ""}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* For him / for her */}
      <section className={`${wrap} flex flex-wrap gap-3 pb-2 pt-10 md:gap-6 md:pt-[72px]`}>
        <Link
          id="him"
          href="/shop?tag=For+him"
          className="flex min-h-[150px] min-w-0 flex-[1_1_360px] flex-col justify-end gap-2 rounded border border-line p-5 text-ink md:min-h-[300px] md:p-8"
          style={{ background: "linear-gradient(135deg, var(--him) 0%, var(--band) 70%)" }}
        >
          <div className={`${eyebrow} max-md:hidden`}>{t("Shop")}</div>
          <div className="font-display text-[34px] font-medium leading-[1.05] md:text-[44px]">{t("For him")}</div>
          <div className="text-sm text-muted md:text-base">{t("Deep, warm and confident.")}</div>
        </Link>
        <Link
          id="her"
          href="/shop?tag=For+her"
          className="flex min-h-[150px] min-w-0 flex-[1_1_360px] flex-col justify-end gap-2 rounded border border-line p-5 text-ink md:min-h-[300px] md:p-8"
          style={{ background: "linear-gradient(135deg, var(--her) 0%, var(--band) 70%)" }}
        >
          <div className={`${eyebrow} max-md:hidden`}>{t("Shop")}</div>
          <div className="font-display text-[34px] font-medium leading-[1.05] md:text-[44px]">{t("For her")}</div>
          <div className="text-sm text-muted md:text-base">{t("Soft, rich and lasting.")}</div>
        </Link>
      </section>

      {/* Story */}
      <section id="story" className={`${wrap} pb-2 pt-12 md:pt-[88px]`}>
        <div className="relative flex flex-wrap gap-x-16 gap-y-8 overflow-hidden rounded border border-line bg-band px-5 py-8 md:px-12 md:py-14">
          <div aria-hidden="true" className="pointer-events-none absolute -top-2 end-2 select-none font-arabic text-[170px] font-bold leading-none md:-top-8 md:end-6 md:text-[300px]" style={{ color: "var(--gold-ghost)" }}>
            هاد
          </div>
          <div className="relative flex min-w-0 flex-[1_1_320px] flex-col gap-2.5">
            <div className={eyebrow}>{t("Our story")}</div>
            <h2 className={h2}>{t("Made for everyday luxury.")}</h2>
          </div>
          <p className="relative min-w-0 flex-[1_1_360px] text-base text-muted md:text-lg">
            [Brand story, 2 to 3 lines from the client. Who HAAD is and what makes the perfumes different.]
          </p>
        </div>
      </section>

      {/* Reviews: only approved ones, section hidden until there are some */}
      {latestReviews.length > 0 && (
        <section aria-label={t("Customer reviews")} className={`${wrap} flex flex-col gap-6 pb-2 pt-10 md:gap-8 md:pt-[72px]`}>
          <h2 className="font-display text-[32px] font-medium leading-[1.05] md:text-[clamp(32px,3.6vw,44px)]">
            {t("What customers say")}
          </h2>
          <div className="flex flex-wrap gap-6">
            {latestReviews.map((r, i) => (
              <figure key={r.id} className={`m-0 flex min-w-0 flex-[1_1_280px] flex-col gap-3 rounded border border-line bg-surface p-5 md:p-6 ${i > 0 ? "max-md:hidden" : ""}`}>
                <div className="tracking-[0.2em] text-accent" role="img" aria-label={t("{n} out of 5 stars", { n: r.rating })}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
                <blockquote className="m-0 text-ink2">{r.comment}</blockquote>
                <figcaption className="text-sm text-muted">{r.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* WhatsApp call to action */}
      <section className={`${wrap} pb-12 pt-10 md:pb-[88px] md:pt-[72px]`}>
        <div className="flex flex-wrap items-center justify-between gap-6 rounded border border-line2 bg-band p-6 md:p-10">
          <div className="min-w-0 flex-[1_1_320px]">
            <div className="font-display text-[28px] font-medium leading-[1.1] md:text-[34px]">
              {t("Not sure which scent to pick?")}
            </div>
            <div className="pt-1.5 text-[15px] text-muted md:text-base">
              {t("Message us on WhatsApp and we will help you choose.")}
            </div>
          </div>
          {whatsappLink() && <a href={whatsappLink("Hello HAAD Fragrances, I need help choosing a perfume.")} className={`${goldBtn} max-md:w-full md:min-h-12`}>{t("Chat on WhatsApp")}</a>}
        </div>
      </section>
    </>
  );
}
