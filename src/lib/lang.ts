import { cookies } from "next/headers";
import { LANG_COOKIE, translate, type Lang, type T } from "./i18n";

export async function getLang(): Promise<Lang> {
  return (await cookies()).get(LANG_COOKIE)?.value === "ur" ? "ur" : "en";
}

/** For server components and server actions: const t = await getT(); */
export async function getT(): Promise<T> {
  const lang = await getLang();
  return (key, vars) => translate(lang, key, vars);
}
