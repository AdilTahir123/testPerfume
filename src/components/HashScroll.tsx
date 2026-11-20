"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function go(id: string) {
  const el = document.getElementById(decodeURIComponent(id));
  if (!el) return false;
  if (window.__lenis) window.__lenis.scrollTo(Math.max(0, el.getBoundingClientRect().top + window.scrollY - 112), { duration: 1.2 });
  else el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  return true;
}

// Links like /#story glide to the section instead of jumping, on the same page and from other pages.
export default function HashScroll() {
  const path = usePathname();
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || !u.hash || u.pathname !== location.pathname || u.search !== location.search) return;
      if (go(u.hash.slice(1))) {
        e.preventDefault();
        history.pushState(null, "", u.pathname + u.search + u.hash);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  useEffect(() => {
    if (!location.hash) return;
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0);
    const id = location.hash.slice(1);
    const tm = window.setTimeout(() => go(id), 250);
    return () => window.clearTimeout(tm);
  }, [path]);
  return null;
}
