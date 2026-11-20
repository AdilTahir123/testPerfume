"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleWishlist } from "@/app/wishlist/actions";
import { useT } from "./lang-client";
import { useToast } from "./toast";

type Ctx = { has: (id: number) => boolean; toggle: (id: number) => void; count: number };
const C = createContext<Ctx | null>(null);

export function WishlistProvider({ initialIds, children }: { initialIds: number[]; children: React.ReactNode }) {
  const [ids, setIds] = useState<number[]>(initialIds);
  const router = useRouter();
  const path = usePathname();
  const toast = useToast();
  const t = useT();

  const toggle = useCallback(
    (id: number) => {
      const was = ids.includes(id);
      setIds((cur) => (was ? cur.filter((x) => x !== id) : [...cur, id])); // show it instantly
      toggleWishlist(id).then((r) => {
        if ("login" in r) {
          setIds((cur) => cur.filter((x) => x !== id));
          router.push(`/login?next=${encodeURIComponent(path)}`);
        } else {
          setIds((cur) => (r.wished ? (cur.includes(id) ? cur : [...cur, id]) : cur.filter((x) => x !== id)));
          toast(r.wished ? t("Saved to your wishlist") : t("Removed from your wishlist"), r.wished ? { href: "/wishlist", label: t("View") } : undefined);
          if (path === "/wishlist") router.refresh();
        }
      });
    },
    [ids, router, path, toast, t],
  );

  return <C.Provider value={{ has: (id) => ids.includes(id), toggle, count: ids.length }}>{children}</C.Provider>;
}

export function useWishlist() {
  const c = useContext(C);
  if (!c) throw new Error("useWishlist must be used inside WishlistProvider");
  return c;
}
