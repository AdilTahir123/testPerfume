"use client";

import { useT } from "@/lib/lang-client";

/** − 2 + control, used on cards, the product page and in the cart. */
export default function Stepper({
  value,
  min = 1,
  max,
  onChange,
  onZero,
  size = "md",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (n: number) => void;
  onZero?: () => void; // when set, pressing − at 1 removes the item
  size?: "md" | "lg";
}) {
  const t = useT();
  const h = size === "lg" ? "h-[52px] w-12" : "h-11 w-11";
  const btn = `${h} flex cursor-pointer items-center justify-center text-lg text-ink active:scale-90 disabled:cursor-not-allowed disabled:opacity-40`;
  return (
    <div className="inline-flex items-center rounded-sm border border-line2" role="group">
      <button type="button" aria-label={onZero && value <= min ? t("Remove") : t("Decrease quantity")} className={btn} onClick={() => (value <= min && onZero ? onZero() : onChange(Math.max(min, value - 1)))}>
        −
      </button>
      <span className="min-w-9 text-center font-medium tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label={t("Increase quantity")} className={btn} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        +
      </button>
    </div>
  );
}
