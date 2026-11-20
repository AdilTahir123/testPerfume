"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useT } from "@/lib/lang-client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-5 py-20 md:px-10">
      <h1 className="font-display text-[40px] font-medium leading-tight">{t("Something went wrong")}</h1>
      <p className="m-0 max-w-[520px] text-muted">{t("Please try again. If it keeps happening, message us on WhatsApp.")}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="bg-gold flex min-h-12 cursor-pointer items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">{t("Try again")}</button>
        <Link href="/" className="flex min-h-12 items-center rounded-sm border border-line2 px-8 text-sm uppercase tracking-[0.08em] text-ink">{t("Home")}</Link>
      </div>
    </section>
  );
}
