"use client";

import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window { __lenis?: Lenis }
}

// Soft mouse-wheel / trackpad scrolling for the whole site. Off for reduced-motion users and on touch screens (native feel is already smooth there).
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      // while the cart drawer / mobile menu lock the page, let the browser scroll the panel itself
      prevent: () => document.body.style.overflow === "hidden",
    });
    window.__lenis = lenis;
    document.documentElement.classList.add("lenis");
    let raf = 0;
    const tick = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); delete window.__lenis; document.documentElement.classList.remove("lenis"); };
  }, []);
  return null;
}
