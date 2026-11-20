import Link from "next/link";
import { getT } from "@/lib/lang";

export default async function ProductNotFound() {
  const t = await getT();
  return (
    <section className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-5 py-20 md:px-10">
      <h1 className="font-display text-[40px] font-medium leading-tight">{t("Perfume not found")}</h1>
      <p className="text-muted">{t("This perfume may have been removed or the link is wrong.")}</p>
      <Link href="/shop" className="bg-gold flex min-h-12 items-center rounded-sm px-8 text-sm font-semibold uppercase tracking-[0.08em] text-onacc">
        {t("Browse all perfumes")}
      </Link>
    </section>
  );
}
