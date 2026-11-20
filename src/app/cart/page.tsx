"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import Stepper from "@/components/Stepper";
import { useT } from "@/lib/lang-client";

const wrap = "mx-auto max-w-[1200px] px-5 md:px-10";

export default function CartPage() {
  const t = useT();
  const { items, ready, subtotal, setQty, remove } = useCart();

  return (
    <section className={`${wrap} flex flex-col gap-8 py-8 md:py-12`}>
      <h1 className="font-display text-[40px] font-medium leading-[1.05] md:text-[56px]">{t("Your cart")}</h1>

      {!ready ? (
        <p className="text-muted">{t("Loading your cart…")}</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded border border-line bg-surface p-6">
          <p className="text-muted">{t("Your cart is empty.")}</p>
          <Link href="/shop" className="bg-gold flex min-h-12 items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">
            {t("Browse perfumes")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-8">
          <ul className="m-0 flex min-w-0 flex-[2_1_420px] list-none flex-col gap-4 p-0">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-4 rounded border border-line bg-surface p-3 md:p-4">
                <Link href={`/product/${i.slug}`} className="relative block h-24 w-24 shrink-0 overflow-hidden rounded md:h-28 md:w-28">
                  <Image src={i.image} alt={i.name} fill sizes="112px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link href={`/product/${i.slug}`} className="font-display text-xl font-semibold leading-tight hover:text-accent md:text-2xl">
                    {i.name}
                  </Link>
                  <div className="text-muted">{formatPrice(i.price)}</div>
                  <div className="mt-auto flex flex-wrap items-center gap-4">
                    <Stepper value={i.quantity} max={Math.max(i.stock, 1)} onChange={(n) => setQty(i.productId, n)} onZero={() => remove(i.productId)} />
                    <button type="button" onClick={() => remove(i.productId)} className="min-h-11 cursor-pointer text-sm text-muted underline">
                      {t("Remove")}
                    </button>
                    <div className="ml-auto font-medium">{formatPrice(i.price * i.quantity)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-4 rounded border border-line bg-surface p-5">
            <h2 className="font-display text-2xl font-medium">{t("Summary")}</h2>
            <div className="flex justify-between"><span className="text-muted">{t("Subtotal")}</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted">{t("Delivery")}</span><span>{t("Free")}</span></div>
            <div className="flex justify-between border-t border-line pt-4 text-lg font-medium"><span>{t("Total")}</span><span>{formatPrice(subtotal)}</span></div>
            <Link href="/checkout" className="bg-gold flex min-h-[52px] items-center justify-center rounded-sm text-sm font-semibold uppercase tracking-[0.08em] text-onacc">
              {t("Checkout")}
            </Link>
            <Link href="/shop" className="flex min-h-11 items-center justify-center text-sm text-accent underline">
              {t("Continue shopping")}
            </Link>
            <p className="m-0 text-sm text-muted">{t("Pay by cash on delivery or bank transfer. Coupons can be added at checkout.")}</p>
          </aside>
        </div>
      )}
    </section>
  );
}
