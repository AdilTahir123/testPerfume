"use client";

import { useActionState } from "react";
import { useT } from "@/lib/lang-client";
import { submitBankProof, type ProofState } from "./actions";

export default function BankProofForm({ number, current }: { number: string; current?: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(submitBankProof.bind(null, number), {} as ProofState);
  const field = "min-h-11 w-full rounded border border-line2 bg-surface px-3 text-base text-ink";
  return (
    <form action={action} className="flex flex-col gap-4 rounded border border-line bg-surface p-5">
      <h2 className="m-0 font-display text-2xl font-medium">{t("Send your payment details")}</h2>
      <div>
        <label htmlFor="reference" className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted">{t("Transaction reference")}</label>
        <input id="reference" name="reference" required minLength={4} maxLength={40} defaultValue={current ?? ""} autoComplete="off" className={field} />
      </div>
      <div>
        <label htmlFor="receipt" className="mb-1 block text-xs uppercase tracking-[0.18em] text-muted">{t("Receipt (JPG, PNG, WebP or PDF, up to 4 MB)")}</label>
        <input id="receipt" name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className={`${field} py-2`} />
      </div>
      {state.error && <p role="alert" className="m-0 rounded border border-red-400/60 bg-red-400/10 p-3 text-red-300">{state.error}</p>}
      {state.ok && <p role="status" className="m-0 rounded border border-accent p-3 text-accent">{t("Thank you. We received your payment details and will verify them soon.")}</p>}
      <button disabled={pending} className="bg-gold flex min-h-12 w-fit cursor-pointer items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc disabled:opacity-60">{pending ? t("Please wait…") : t("Submit payment details")}</button>
    </form>
  );
}
