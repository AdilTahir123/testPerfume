import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeaturedBottle from "@/components/FeaturedBottle";
import ProductCard from "@/components/ProductCard";
import ReviewForm from "@/components/ReviewForm";
import { getT } from "@/lib/lang";
import { siteUrl } from "@/lib/site";
import { getUser } from "@/lib/auth";
import ProductBuy from "@/components/ProductBuy";
import { formatPrice } from "@/lib/format";
import { getApprovedReviews, getProductBySlug, getRelatedProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Perfume not found | HAAD Fragrances" };
  const description = product.description || `${product.name}, ${product.sizeMl}ml perfume by HAAD.`;
  return {
    title: `${product.name} | HAAD Fragrances`,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      images: [{ url: product.image, alt: product.imageAlt }],
    },
  };
}

const wrap = "mx-auto max-w-[1200px] px-5 md:px-10";
const eyebrow = "font-brand text-[10px] uppercase tracking-[0.22em] text-accent md:text-[11px]";

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product),
    getApprovedReviews(product.id),
  ]);

  const t = await getT();
  const user = await getUser();
  const soldOut = product.stock <= 0;
  const fewLeft = !soldOut && product.stock <= 5;
  const notes = [
    [t("Top"), product.topNotes],
    [t("Heart"), product.heartNotes],
    [t("Base"), product.baseNotes],
  ].filter(([, v]) => v);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: new URL(product.image, siteUrl).toString(),
    brand: { "@type": "Brand", name: "HAAD Fragrances" },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: "PKR",
      price: product.price,
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
    ...(reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (reviews.reduce((n, r) => n + r.rating, 0) / reviews.length).toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label={t("Breadcrumb")} className={`${wrap} py-4 text-sm text-muted`}>
        <Link href="/" className="hover:text-accent">{t("Home")}</Link>
        {" / "}
        <Link href="/shop" className="hover:text-accent">{t("Shop")}</Link>
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <section className={`${wrap} flex flex-wrap items-start gap-8 pb-6 pt-2 md:gap-12`}>
        <FeaturedBottle image={product.image} alt={product.imageAlt} />

        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
          <div className={eyebrow}>{t(product.tag)}</div>
          <h1 className="font-display text-[40px] font-medium leading-[1.05] md:text-[56px]">
            {product.name}
          </h1>
          <div className="text-[26px] font-medium">
            {formatPrice(product.price)}{" "}
            <span className="text-[15px] font-normal text-muted">· {product.sizeMl}ml · {t("Free delivery")}</span>
          </div>
          {product.description && (
            <p className="max-w-[480px] text-base text-muted md:text-lg">{product.description}</p>
          )}

          {notes.length > 0 && (
            <div>
              <div className="pb-2 text-xs uppercase tracking-[0.18em] text-muted">{t("Scent notes")}</div>
              <div className="grid grid-cols-3 gap-3">
                {notes.map(([k, v]) => (
                  <div key={k} className="border-t border-line2 pt-2.5">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted">{k}</div>
                    <div className="text-sm md:text-base">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className={`text-sm font-medium ${soldOut ? "text-red-400" : fewLeft ? "text-accent" : "text-muted"}`}
            role="status"
          >
            {soldOut ? t("Sold out") : fewLeft ? t("Only {n} left", { n: product.stock }) : t("In stock")}
          </div>

          <ProductBuy product={product} />

          <ul className="flex flex-col gap-2 border-t border-line pt-4 text-[15px] text-muted">
            <li>{t("Free delivery across Pakistan")}</li>
            <li>{t("Cash on delivery or bank transfer")}</li>
            <li>{t("Questions? Message us on WhatsApp")}</li>
          </ul>
        </div>
      </section>

      <section aria-label={t("Reviews")} className={`${wrap} flex flex-col gap-5 pb-2 pt-10`}>
        <h2 className="font-display text-[32px] font-medium leading-[1.05] md:text-[40px]">{t("Reviews")}</h2>
        {reviews.length === 0 ? (
          <p className="rounded border border-line bg-surface p-5 text-muted">
            {t("No reviews yet for this perfume.")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {reviews.map((r) => (
              <figure key={r.id} className="m-0 flex min-w-0 flex-[1_1_280px] flex-col gap-3 rounded border border-line bg-surface p-5">
                <div className="tracking-[0.2em] text-accent" role="img" aria-label={t("{n} out of 5 stars", { n: r.rating })}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
                <blockquote className="m-0 text-ink2">{r.comment}</blockquote>
                <figcaption className="text-sm text-muted">{r.name}</figcaption>
              </figure>
            ))}
          </div>
        )}
        <ReviewForm productId={product.id} knownName={user?.name} />
      </section>

      {related.length > 0 && (
        <section aria-label={t("More perfumes")} className={`${wrap} flex flex-col gap-6 pb-12 pt-12`}>
          <h2 className="font-display text-[32px] font-medium leading-[1.05] md:text-[40px]">{t("You may also like")}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
