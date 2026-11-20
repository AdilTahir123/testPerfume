import Image from "next/image";
import Link from "next/link";
import { getT } from "@/lib/lang";
import type { Product } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import WishlistButton from "./WishlistButton";
import AddToCartButton from "./AddToCartButton";

export default async function ProductCard({ product }: { product: Product }) {
  const t = await getT();
  const soldOut = product.stock <= 0;
  const stockText = soldOut ? t("Sold out") : product.stock <= 5 ? t("Few left") : t("In stock");
  return (
    <article className="flex min-w-0 flex-col rounded border border-line bg-surface">
      <div className="relative h-[220px] overflow-hidden md:h-[300px]">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 block">
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover"
          />
        </Link>
        <WishlistButton productId={product.id} name={product.name} />
      </div>
      <div className="flex flex-col gap-1.5 p-4 md:p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-muted">{t(product.tag)}</div>
        <h3 className="font-display text-2xl font-semibold leading-tight md:text-[28px]">
          <Link href={`/product/${product.slug}`} className="hover:text-accent">
            {product.name}
          </Link>
        </h3>
        <div className="text-sm text-muted">
          {product.sizeMl}ml &nbsp;·&nbsp; {stockText}
        </div>
        <div className="pb-3 pt-2 text-lg font-medium">{formatPrice(product.price)}</div>
        <AddToCartButton
          variant="card"
          product={product}
          className="min-h-11 cursor-pointer rounded-sm border border-accent px-3 py-3 text-center active:scale-[0.98] text-sm font-semibold uppercase tracking-[0.08em] text-accent disabled:cursor-not-allowed disabled:opacity-40"
        />
      </div>
    </article>
  );
}
