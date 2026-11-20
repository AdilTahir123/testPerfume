"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useCart } from "@/lib/cart";
import { useT } from "@/lib/lang-client";
import LangToggle from "./LangToggle";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?tag=For+him", label: "For him" },
  { href: "/shop?tag=For+her", label: "For her" },
  { href: "/#story", label: "Our story" },
];

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const t = useT();

  return (
    <header className={`sticky top-0 z-40 border-b bg-bg/90 backdrop-blur-md transition-[border-color,box-shadow] duration-300 ${scrolled ? "border-line shadow-[0_6px_24px_rgba(0,0,0,0.25)]" : "border-transparent"}`}>
    <div className={`mx-auto max-w-[1200px] px-5 transition-[padding] duration-300 md:px-10 ${scrolled ? "py-2" : "py-3 md:py-4"}`}>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          aria-label={t("Open menu")}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center text-ink md:hidden"
        >
          <svg {...iconProps}>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <Link href="/" aria-label={t("HAAD Fragrances home")} className="shrink-0">
          <Image
            src="/images/haad-logo-mark.png"
            alt="HAAD Fragrances"
            width={520}
            height={398}
            priority
            className={`logo-mark w-auto transition-[height] duration-300 ${scrolled ? "h-10 md:h-11" : "h-12 md:h-[60px]"}`}
          />
        </Link>

        <nav
          aria-label={t("Main menu")}
          className="hidden gap-8 text-[15px] uppercase tracking-[0.06em] md:flex"
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-ink hover:text-accent">
              {t(l.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <LangToggle />
          <Link href="/shop" aria-label={t("Search perfumes")} className="flex h-11 w-11 items-center justify-center text-ink">
            <svg {...iconProps}>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
          </Link>
          <Link href="/wishlist" aria-label={t("Wishlist")} className="hidden h-11 w-11 items-center justify-center text-ink md:flex">
            <svg {...iconProps}>
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
            </svg>
          </Link>
          <Link href="/account" aria-label={t("Account")} className="hidden h-11 w-11 items-center justify-center text-ink md:flex">
            <svg {...iconProps}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
            </svg>
          </Link>
          <Link href="/cart" onClick={(e) => { e.preventDefault(); openDrawer(); }} aria-haspopup="dialog" aria-label={t("Cart, {n} items", { n: count })} className="relative flex h-11 w-11 items-center justify-center text-ink">
            <svg {...iconProps}>
              <path d="M5 8h14l-1 12H6L5 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {count > 0 && (
              <span key={count} className="haad-bump bg-gold absolute end-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-semibold text-onacc">
                {count}
              </span>
            )}
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {open && (
        <nav aria-label={t("Mobile menu")} className="mt-3 flex flex-col border-t border-line md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center border-b border-line text-ink"
            >
              {t(l.label)}
            </Link>
          ))}
          {[
            ["/wishlist", "Wishlist"],
            ["/account", "Account"],
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-line text-ink">
              {t(label)}
            </Link>
          ))}
          <LangToggle inMenu />
        </nav>
      )}
    </div>
    </header>
  );
}
