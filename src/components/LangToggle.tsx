"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLang } from "@/lib/lang-actions";
import { useLang } from "@/lib/lang-client";

export default function LangToggle({ inMenu = false }: { inMenu?: boolean }) {
  const lang = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = lang === "ur" ? "en" : "ur";
  return (
    <button
      type="button"
      disabled={pending}
      lang={next}
      aria-label={next === "ur" ? "اردو میں دیکھیں" : "View in English"}
      onClick={() => start(async () => { await setLang(next); router.refresh(); })}
      className={inMenu ? "flex min-h-12 w-full cursor-pointer items-center border-b border-line text-start text-ink md:hidden" : "mx-1 hidden min-h-11 cursor-pointer px-3 text-sm text-muted hover:text-accent md:block"}
    >
      {lang === "ur" ? "English" : "اردو"}
    </button>
  );
}
