"use client";

import { useActionState } from "react";
import { submitReview } from "@/app/product/[slug]/actions";
import { useT } from "@/lib/lang-client";

const field = "min-h-11 w-full rounded border border-line2 bg-surface px-3 text-base text-ink";
const label = "mb-1 block text-xs uppercase tracking-[0.18em] text-muted";

export default function ReviewForm({ productId, knownName }: { productId: number; knownName?: string }) {
  const t = useT();
  const [state, run, pending] = useActionState(submitReview, {});
  if (state.done) {
    return <p role="status" className="m-0 rounded border border-line bg-surface p-5 text-ink2">{t("Thank you! Your review will appear after we check it.")}</p>;
  }
  return (
    <form action={run} className="flex max-w-[560px] flex-col gap-4 rounded border border-line bg-surface p-5">
      <h3 className="m-0 font-display text-2xl font-medium">{t("Write a review")}</h3>
      <input type="hidden" name="productId" value={productId} />
      <div aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {!knownName && <div><label htmlFor="rname" className={label}>{t("Your name")}</label><input id="rname" name="name" required className={field} /></div>}
      <div>
        <label htmlFor="rating" className={label}>{t("Rating")}</label>
        <select id="rating" name="rating" defaultValue="5" className={field}>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)} ({n})</option>)}
        </select>
      </div>
      <div><label htmlFor="comment" className={label}>{t("Your review")}</label><textarea id="comment" name="comment" required rows={3} className={`${field} py-2`} /></div>
      {state.error && <p role="alert" className="m-0 text-red-300">{state.error}</p>}
      <button disabled={pending} className="bg-gold flex min-h-12 w-fit cursor-pointer items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc disabled:opacity-60">{pending ? t("Sending…") : t("Send review")}</button>
    </form>
  );
}
