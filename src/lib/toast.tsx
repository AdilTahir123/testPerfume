"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type Toast = { id: number; message: string; href?: string; label?: string };
type Ctx = { toast: (message: string, action?: { href: string; label: string }) => void };
const C = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const next = useRef(1);

  const toast = useCallback((message: string, action?: { href: string; label: string }) => {
    const id = next.current++;
    setList((cur) => [...cur.slice(-2), { id, message, href: action?.href, label: action?.label }]);
    setTimeout(() => setList((cur) => cur.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <C.Provider value={{ toast }}>
      {children}
      {/* aria-live so screen readers hear it; sits above the phone's bottom bar */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {list.map((t) => (
          <div key={t.id} className="haad-toast pointer-events-auto flex max-w-[420px] items-center gap-4 rounded border border-line2 bg-surface px-4 py-3 text-sm text-ink shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
            <span>{t.message}</span>
            {t.href && <Link href={t.href} className="shrink-0 font-semibold uppercase tracking-[0.06em] text-accent">{t.label}</Link>}
          </div>
        ))}
      </div>
    </C.Provider>
  );
}

export function useToast() {
  const c = useContext(C);
  if (!c) throw new Error("useToast must be used inside ToastProvider");
  return c.toast;
}
