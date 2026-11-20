import Link from "next/link";
import { getT } from "@/lib/lang";

export default async function NotFound() {
  const t = await getT();
  return (
    <section className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-5 py-20 md:px-10">
      <h1 className="font-display text-[40px] font-medium leading-tight">{t("Page not found")}</h1>
      <p className="m-0 text-muted">{t("This page may have moved or the link is wrong.")}</p>
      <Link href="/shop" className="bg-gold flex min-h-12 items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">{t("Browse all perfumes")}</Link>
    </section>
  );
}
