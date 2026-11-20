"use client";

import { useWishlist } from "@/lib/wishlist";
import { useT } from "@/lib/lang-client";

const heart = "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z";

export default function WishlistButton({ productId, name, full = false }: { productId: number; name: string; full?: boolean }) {
  const { has, toggle } = useWishlist();
  const t = useT();
  const on = has(productId);
  const icon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d={heart} />
    </svg>
  );
  if (full) {
    return (
      <button type="button" aria-pressed={on} onClick={() => toggle(productId)} className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-sm border border-line2 px-8 text-sm font-medium uppercase tracking-[0.08em] text-ink max-md:w-full">
        <span className={on ? "text-accent" : ""}>{icon}</span>
        {on ? t("In your wishlist") : t("Add to wishlist")}
      </button>
    );
  }
  return (
    <button type="button" aria-pressed={on} aria-label={on ? t("Remove {name} from wishlist", { name }) : t("Add {name} to wishlist", { name })} onClick={() => toggle(productId)} className={`absolute end-2 top-2 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black/60 ${on ? "text-accent" : "text-[#f4efe6]"}`}>
      {icon}
    </button>
  );
}
