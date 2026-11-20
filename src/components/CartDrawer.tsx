"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useT } from "@/lib/lang-client";
import Stepper from "./Stepper";

export default function CartDrawer() {
  const { items, ready, subtotal, drawerOpen, closeDrawer, setQty, remove } = useCart();
  const t = useT();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    opener.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // the page behind must not scroll
    panel.current?.querySelector<HTMLElement>("[data-first]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])");
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={`fixed inset-0 z-[70] ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen} inert={!drawerOpen}>
      <div onClick={closeDrawer} className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("Your cart")}
        className={`absolute inset-y-0 end-0 flex w-full max-w-[420px] flex-col border-s border-line2 bg-bg transition-transform duration-300 ease-out ${drawerOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="m-0 font-display text-2xl font-medium">{t("Your cart")}</h2>
          <button type="button" data-first aria-label={t("Close")} onClick={closeDrawer} className="flex h-11 w-11 cursor-pointer items-center justify-center text-ink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {!ready || items.length === 0 ? (
          <div className="flex flex-1 flex-col items-start gap-4 p-5">
            <p className="m-0 text-muted">{t("Your cart is empty.")}</p>
            <Link href="/shop" onClick={closeDrawer} className="bg-gold flex min-h-12 items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">{t("Browse perfumes")}</Link>
          </div>
        ) : (
          <>
            <ul className="m-0 flex flex-1 list-none flex-col gap-4 overflow-y-auto p-5">
              {items.map((i) => (
                <li key={i.productId} className="flex gap-3">
                  <Link href={`/product/${i.slug}`} onClick={closeDrawer} className="relative block h-20 w-20 shrink-0 overflow-hidden rounded border border-line">
                    <Image src={i.image} alt={i.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${i.slug}`} onClick={closeDrawer} className="font-display text-lg font-semibold leading-tight hover:text-accent">{i.name}</Link>
                      <span className="shrink-0 text-sm font-medium">{formatPrice(i.price * i.quantity)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Stepper value={i.quantity} max={Math.max(i.stock, 1)} onChange={(n) => setQty(i.productId, n)} onZero={() => remove(i.productId)} />
                      <button type="button" onClick={() => remove(i.productId)} className="min-h-11 cursor-pointer px-1 text-sm text-muted underline">{t("Remove")}</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 border-t border-line p-5">
              <div className="flex justify-between text-lg font-medium"><span>{t("Subtotal")}</span><span>{formatPrice(subtotal)}</span></div>
              <p className="m-0 text-sm text-muted">{t("Free delivery across Pakistan")}</p>
              <Link href="/checkout" onClick={closeDrawer} className="bg-gold flex min-h-[52px] items-center justify-center rounded-sm text-sm font-semibold uppercase tracking-[0.08em] text-onacc">{t("Checkout")}</Link>
              <div className="flex justify-between">
                <Link href="/cart" onClick={closeDrawer} className="flex min-h-11 items-center text-sm text-accent underline">{t("View cart")}</Link>
                <button type="button" onClick={closeDrawer} className="min-h-11 cursor-pointer text-sm text-muted underline">{t("Continue shopping")}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
