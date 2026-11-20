"use client";

import Image from "next/image";
import { useRef } from "react";
import { useT } from "@/lib/lang-client";

/**
 * The product photo sits on a card that turns with your finger or mouse, with a moving shine.
 * It is a tilt, not a true 360° spin: a real spin needs photos from every side of the bottle.
 */
export default function FeaturedBottle({ image, alt, priority = false }: { image: string; alt: string; priority?: boolean }) {
  const t = useT();
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  function aim(e: React.PointerEvent) {
    const s = stage.current;
    const c = card.current;
    if (!s || !c) return;
    if (e.pointerType === "touch" && e.buttons === 0) return;
    const r = s.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; // 0..1
    const y = (e.clientY - r.top) / r.height;
    c.classList.add("is-aimed");
    c.style.setProperty("--ry", `${((x - 0.5) * 2 * 26).toFixed(1)}deg`);
    c.style.setProperty("--rx", `${(-(y - 0.5) * 2 * 14).toFixed(1)}deg`);
    c.style.setProperty("--gx", `${(x * 100).toFixed(0)}%`);
    c.style.setProperty("--gy", `${(y * 100).toFixed(0)}%`);
  }

  function rest() {
    const c = card.current;
    if (!c) return;
    c.classList.remove("is-aimed");
    c.style.removeProperty("--ry");
    c.style.removeProperty("--rx");
  }

  return (
    <div
      ref={stage}
      onPointerMove={aim}
      onPointerDown={aim}
      onPointerLeave={rest}
      onPointerUp={(e) => e.pointerType === "touch" && rest()}
      onPointerCancel={rest}
      className="tilt-stage relative h-[360px] min-w-0 flex-[1_1_380px] touch-pan-y select-none overflow-hidden rounded border border-line md:h-[540px]"
      style={{ background: "radial-gradient(ellipse at 50% 55%, var(--hero1) 0%, var(--hero2) 55%, var(--bg) 100%)" }}
    >
      <div ref={card} className="tilt-card absolute inset-5 md:inset-9">
        <div className="relative h-full w-full overflow-hidden rounded shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
          <Image
            src={image}
            alt={alt}
            fill
            priority={priority}
            draggable={false}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[center_40%]"
          />
          <div aria-hidden="true" className="tilt-shine pointer-events-none absolute inset-0" />
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-line2 bg-bg/90 px-4 py-2 text-xs text-muted md:text-[13px]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <path d="M20 12a8 8 0 1 1-3-6.2" />
          <path d="M20 4v5h-5" />
        </svg>
        {t("Move or drag to turn the bottle")}
      </div>
    </div>
  );
}
