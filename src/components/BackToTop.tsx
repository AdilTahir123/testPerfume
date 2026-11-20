"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/lang-client";

export default function BackToTop() {
  const t = useT();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button
      type="button"
      aria-label={t("Back to top")}
      tabIndex={show ? 0 : -1}
      onClick={() => (window.__lenis ? window.__lenis.scrollTo(0, { duration: 1 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
      className={`fixed bottom-24 end-4 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line2 bg-bg/90 text-ink backdrop-blur transition-all duration-300 md:bottom-6 md:end-6 ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </button>
  );
}
