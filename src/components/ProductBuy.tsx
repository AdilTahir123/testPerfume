"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useT } from "@/lib/lang-client";
import AddToCartButton from "./AddToCartButton";
import Stepper from "./Stepper";
import WishlistButton from "./WishlistButton";

const solid =
  "bg-gold flex min-h-[52px] cursor-pointer items-center justify-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 max-md:flex-1";

/** Quantity + add to cart + wishlist for the product page, with a sticky bar on phones. */
export default function ProductBuy({ product }: { product: Product }) {
  const t = useT();
  const { qtyOf } = useCart();
  const [qty, setQty] = useState(1);
  const [barVisible, setBarVisible] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const soldOut = product.stock <= 0;
  const inCart = qtyOf(product.id);

  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div ref={anchor} className="flex flex-wrap items-center gap-3">
        {!soldOut && <Stepper value={qty} max={product.stock} onChange={setQty} size="lg" />}
        <AddToCartButton product={product} qty={qty} className={solid} />
        <WishlistButton productId={product.id} name={product.name} full />
      </div>
      {inCart > 0 && (
        <p className="m-0 text-sm text-accent" role="status">
          ✓ {t("{n} in your cart", { n: inCart })} ·{" "}
          <Link href="/cart" className="underline">{t("View cart")}</Link>
        </p>
      )}

      {/* Phone only: the add button stays reachable while you read the page */}
      {!soldOut && (
        <div
          aria-hidden={!barVisible}
          className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line2 bg-bg px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${barVisible ? "translate-y-0" : "translate-y-full"}`}
        >
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm text-muted">{product.name}</div>
            <div className="font-medium">{formatPrice(product.price)}</div>
          </div>
          <div className="ms-auto flex min-w-0 flex-1 justify-end">
            <AddToCartButton product={product} qty={qty} className={`${solid} !px-5`} />
          </div>
        </div>
      )}
    </div>
  );
}
