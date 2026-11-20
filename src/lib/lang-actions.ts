"use server";

import { cookies } from "next/headers";
import { LANG_COOKIE } from "./i18n";

export async function setLang(lang: string) {
  (await cookies()).set(LANG_COOKIE, lang === "ur" ? "ur" : "en", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
