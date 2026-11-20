"use client";

import { useEffect, useRef } from "react";

export default function AutoSubmit({ action, fields }: { action: string; fields: Record<string, string> }) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { ref.current?.submit(); }, []);
  return (
    <section className="mx-auto flex max-w-[560px] flex-col items-center gap-5 px-5 py-20 text-center">
      <p className="text-muted">Taking you to the secure payment page…</p>
      <form ref={ref} method="post" action={action} className="flex flex-col items-center gap-3">
        {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <noscript><button type="submit" className="bg-gold min-h-12 rounded-sm px-8 text-sm font-semibold uppercase text-onacc">Continue to payment</button></noscript>
      </form>
    </section>
  );
}
