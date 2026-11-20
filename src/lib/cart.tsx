"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  qtyOf: (productId: number) => number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const KEY = "haad-cart";

// The saved cart is just text in the browser, so never trust its shape
function cleanItems(data: unknown): CartItem[] {
  if (!Array.isArray(data)) return [];
  const out: CartItem[] = [];
  for (const i of data.slice(0, 30)) {
    if (!i || typeof i !== "object") continue;
    const o = i as Record<string, unknown>;
    const productId = Number(o.productId);
    const price = Number(o.price);
    const stock = Number(o.stock);
    const quantity = Math.floor(Number(o.quantity));
    if (!Number.isInteger(productId) || !(price >= 0) || !(stock >= 0) || !(quantity >= 1)) continue;
    out.push({
      productId,
      slug: String(o.slug ?? ""),
      name: String(o.name ?? ""),
      price,
      image: typeof o.image === "string" && o.image.startsWith("/") ? o.image : "/images/haad-logo.jpg",
      stock,
      quantity: Math.min(quantity, Math.max(stock, 1)),
    });
  }
  return out;
}
const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(cleanItems(JSON.parse(raw)));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.productId === item.productId);
      if (found) {
        return cur.map((i) =>
          i.productId === item.productId
            ? { ...i, stock: item.stock, quantity: Math.min(i.quantity + qty, Math.max(item.stock, 1)) }
            : i,
        );
      }
      return [...cur, { ...item, quantity: Math.min(qty, Math.max(item.stock, 1)) }];
    });
  }, []);

  const setQty = useCallback((productId: number, qty: number) => {
    setItems((cur) =>
      cur.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(qty, Math.max(i.stock, 1))) } : i)),
    );
  }, []);

  const remove = useCallback((productId: number) => {
    setItems((cur) => cur.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
      drawerOpen,
      openDrawer,
      closeDrawer,
      qtyOf: (id: number) => items.find((i) => i.productId === id)?.quantity ?? 0,
      add,
      setQty,
      remove,
      clear,
    }),
    [items, ready, drawerOpen, openDrawer, closeDrawer, add, setQty, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
