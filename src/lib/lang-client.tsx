"use client";

import { createContext, useContext } from "react";
import { translate, type Lang, type T } from "./i18n";

const L = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <L.Provider value={lang}>{children}</L.Provider>;
}

export const useLang = () => useContext(L);

/** For client components: const t = useT(); */
export function useT(): T {
  const lang = useContext(L);
  return (key, vars) => translate(lang, key, vars);
}
