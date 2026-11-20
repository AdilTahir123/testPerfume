"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useT } from "@/lib/lang-client";
import { applyCoupon, placeOrder } from "./actions";
import type { BankDetails, Method } from "@/lib/payments";

export type CheckoutDefaults = { name: string; phone: string; email: string };

const wrap = "mx-auto max-w-[1200px] px-5 md:px-10";
const field = "min-h-11 w-full rounded border border-line2 bg-surface px-3 text-base text-ink";
const label = "mb-1 block text-xs uppercase tracking-[0.18em] text-muted";

export default function CheckoutForm({ defaults, available, bank }: { defaults: CheckoutDefaults; available: Record<Method, boolean>; bank: BankDetails | null }) {
  const t = useT();
  const { items, ready, subtotal, clear } = useCart();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  // On a phone the message can be off screen, so bring it into view
  useEffect(() => {
    if (error) document.getElementById("checkout-error")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [error]);
  const [payment, setPayment] = useState<Method>("cod");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  const lines = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = subtotal - discount;

  function onApply() {
    setCouponMsg("");
    start(async () => {
      const r = await applyCoupon(couponInput, lines);
      if (r.ok) {
        setCoupon({ code: r.code, discount: r.discount, label: r.label });
        setCouponMsg(t("{code} applied ({label}).", { code: r.code, label: r.label }));
      } else {
        setCoupon(null);
        setCouponMsg(r.error);
      }
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    start(async () => {
      const r = await placeOrder({
        name: get("name"),
        phone: get("phone"),
        email: get("email"),
        address: get("address"),
        city: get("city"),
        note: get("note"),
        paymentMethod: payment,
        coupon: coupon?.code ?? "",
        lines,
      });
      if (r.ok) {
        clear();
        // online payments continue on the gateway page; everything else goes to the order page
        if (r.next.startsWith("/pay/")) window.location.assign(r.next);
        else router.push(r.next);
      } else {
        setError(r.error);
      }
    });
  }

  if (!ready) return <section className={`${wrap} py-12 text-muted`}>{t("Loading…")}</section>;

  if (items.length === 0) {
    return (
      <section className={`${wrap} flex flex-col items-start gap-4 py-12`}>
        <h1 className="font-display text-[40px] font-medium">{t("Checkout")}</h1>
        <p className="text-muted">{t("Your cart is empty.")}</p>
        <Link href="/shop" className="bg-gold flex min-h-12 items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">{t("Browse perfumes")}</Link>
      </section>
    );
  }

  return (
    <section className={`${wrap} flex flex-col gap-8 py-8 md:py-12`}>
      <h1 className="font-display text-[40px] font-medium leading-[1.05] md:text-[56px]">{t("Checkout")}</h1>
      <div className="flex flex-wrap items-start gap-8">
        <form onSubmit={onSubmit} className="flex min-w-0 flex-[2_1_420px] flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div><label htmlFor="name" className={label}>{t("Full name")}</label><input id="name" name="name" required autoComplete="name" defaultValue={defaults.name} className={field} /></div>
            <div><label htmlFor="phone" className={label}>{t("Mobile number")}</label><input id="phone" name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" defaultValue={defaults.phone} className={field} /></div>
          </div>
          <div><label htmlFor="email" className={label}>{t("Email (optional)")}</label><input id="email" name="email" type="email" autoComplete="email" defaultValue={defaults.email} className={field} /></div>
          <div><label htmlFor="address" className={label}>{t("Full address")}</label><textarea id="address" name="address" required rows={3} autoComplete="street-address" className={`${field} py-2`} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label htmlFor="city" className={label}>{t("City")}</label><input id="city" name="city" required autoComplete="address-level2" className={field} /></div>
            <div><label htmlFor="note" className={label}>{t("Note (optional)")}</label><input id="note" name="note" className={field} /></div>
          </div>

          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
            <legend className={label}>{t("Payment")}</legend>
            {([
              ["jazzcash", "JazzCash", "Pay with your JazzCash account. You will be taken to JazzCash's secure page."],
              ["easypaisa", "Easypaisa", "Pay with Easypaisa. You will be taken to Easypaisa's secure page."],
              ["bank_transfer", "Meezan Bank transfer", "Send the amount to our bank account, then enter the transaction reference and upload your receipt."],
              ["cod", "Cash on delivery", "Pay the rider when the parcel arrives."],
            ] as const).map(([v, title, d]) => {
              const ok = available[v];
              return (
                <label key={v} className={`flex min-h-12 items-start gap-3 rounded border p-3 ${ok ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${payment === v ? "border-accent" : "border-line2"}`}>
                  <input type="radio" name="payment" value={v} disabled={!ok} checked={payment === v} onChange={() => setPayment(v)} className="mt-1 accent-[#ddb54a]" />
                  <span>
                    <span className="block font-medium">{t(title)}{!ok && <span className="ms-2 text-xs uppercase tracking-[0.12em] text-muted">{t("Not available yet")}</span>}</span>
                    <span className="block text-sm text-muted">{t(d)}</span>
                    {v === "bank_transfer" && ok && payment === v && bank && (
                      <span className="mt-3 flex flex-col gap-1 rounded border border-line bg-bg p-3 text-sm" data-testid="bank-details">
                        <span><span className="text-muted">{t("Bank")}: </span>{bank.bank}</span>
                        <span><span className="text-muted">{t("Account title")}: </span>{bank.title}</span>
                        {bank.account && <span><span className="text-muted">{t("Account number")}: </span><span dir="ltr">{bank.account}</span></span>}
                        {bank.iban && <span><span className="text-muted">IBAN: </span><span dir="ltr">{bank.iban}</span></span>}
                        <span className="text-muted">{t("Your order is confirmed only after we verify your payment.")}</span>
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </fieldset>

          {error && <p id="checkout-error" role="alert" className="m-0 rounded border border-red-400/60 bg-red-400/10 p-3 text-red-300">{error}</p>}

          <button type="submit" disabled={pending} className="bg-gold flex min-h-[52px] cursor-pointer items-center justify-center rounded-sm text-sm font-semibold uppercase tracking-[0.08em] text-onacc disabled:opacity-60">
            {pending ? t("Please wait…") : t("Place order · {total}", { total: formatPrice(total) })}
          </button>
        </form>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4 rounded border border-line bg-surface p-5">
          <h2 className="font-display text-2xl font-medium">{t("Your order")}</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3"><span>{i.name} × {i.quantity}</span><span>{formatPrice(i.price * i.quantity)}</span></li>
            ))}
          </ul>
          <div className="flex gap-2 border-t border-line pt-4">
            <input aria-label={t("Coupon code")} value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder={t("Coupon code")} className={field} />
            <button type="button" onClick={onApply} disabled={pending} className="min-h-11 cursor-pointer rounded-sm border border-accent px-4 text-sm font-semibold uppercase text-accent">{t("Apply")}</button>
          </div>
          {couponMsg && <p role="status" className="m-0 text-sm text-muted">{couponMsg}</p>}
          <div className="flex justify-between"><span className="text-muted">{t("Subtotal")}</span><span>{formatPrice(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between"><span className="text-muted">{t("Discount")}</span><span>− {formatPrice(discount)}</span></div>}
          <div className="flex justify-between"><span className="text-muted">{t("Delivery")}</span><span>{t("Free")}</span></div>
          <div className="flex justify-between border-t border-line pt-4 text-lg font-medium"><span>{t("Total")}</span><span>{formatPrice(total)}</span></div>
        </aside>
      </div>
    </section>
  );
}
