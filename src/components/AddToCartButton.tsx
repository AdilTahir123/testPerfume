"use client";

import { useState } from "react";
import type { Product } from "@/db/schema";
import { useCart } from "@/lib/cart";
import { useT } from "@/lib/lang-client";
import { useToast } from "@/lib/toast";
import Stepper from "./Stepper";

const toItem = (p: Product) => ({ productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image, stock: p.stock });

/**
 * Add to cart.
 * - "card": after the first add it turns into a  − 1 +  stepper, so you always see how many are in the cart.
 * - "solid": big button; adds `qty` and opens the cart drawer so you see what happened.
 */
export default function AddToCartButton({
  product,
  className,
  variant = "solid",
  qty = 1,
}: {
  product: Product;
  className: string;
  variant?: "card" | "solid";
  qty?: number;
}) {
  const { add, setQty, remove, qtyOf, openDrawer } = useCart();
  const toast = useToast();
  const t = useT();
  const [flash, setFlash] = useState(false);
  const soldOut = product.stock <= 0;
  const inCart = qtyOf(product.id);

  if (variant === "card" && inCart > 0 && !soldOut) {
    return (
      <div className="flex items-center justify-between gap-2">
        <Stepper value={inCart} max={product.stock} onChange={(n) => setQty(product.id, n)} onZero={() => remove(product.id)} />
        <span className="text-sm font-medium text-accent">{t("In cart")}</span>
      </div>
    );
  }

  function onClick() {
    const before = inCart;
    add(toItem(product), qty);
    if (variant === "card") {
      toast(t("{name} added to cart", { name: product.name }), { href: "/cart", label: t("View cart") });
      return;
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 1600);
    if (before + qty > product.stock) toast(t("Only {n} available", { n: product.stock }));
    openDrawer();
  }

  return (
    <button type="button" disabled={soldOut} onClick={onClick} className={className}>
      {soldOut ? t("Sold out") : flash ? t("Added ✓") : t("Add to cart")}
    </button>
  );
}
