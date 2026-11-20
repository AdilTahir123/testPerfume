import Link from "next/link";
import { getT } from "@/lib/lang";
import { site, whatsappLink } from "@/lib/site";
import Image from "next/image";

export default async function Footer() {
  const t = await getT();
  return (
    <footer className="border-t border-line bg-foot">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-8 px-5 py-12 md:gap-x-16 md:px-10">
        <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-3">
          <Image src="/images/haad-logo-mark.png" alt="HAAD Fragrances" width={520} height={398} className="logo-mark h-16 w-auto self-start" />
          <p className="text-[15px] text-muted">
            {t("Perfume for men and women. Free delivery across Pakistan.")}
          </p>
        </div>
        <div className="flex min-w-0 flex-[1_1_160px] flex-col text-[15px]">
          <div className="pb-2 text-[13px] uppercase tracking-[0.18em] text-muted">{t("Help")}</div>
          <Link href="/delivery" className="flex min-h-9 items-center text-ink">{t("Delivery")}</Link>
          <Link href="/returns" className="flex min-h-9 items-center text-ink">{t("Returns and refunds")}</Link>
          <Link href="/privacy" className="flex min-h-9 items-center text-ink">{t("Privacy policy")}</Link>
        </div>
        <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-1.5 text-[15px]">
          <div className="pb-2 text-[13px] uppercase tracking-[0.18em] text-muted">{t("Contact")}</div>
          {site.whatsapp && <a href={whatsappLink()} className="text-ink">WhatsApp: +{site.whatsapp}</a>}
          {site.email && <a href={`mailto:${site.email}`} className="text-ink">{site.email}</a>}
          {(site.instagram || site.facebook) && (
            <div className="flex gap-4 text-muted">
              {site.instagram && <a href={site.instagram}>Instagram</a>}
              {site.facebook && <a href={site.facebook}>Facebook</a>}
            </div>
          )}
          {!site.whatsapp && !site.email && !site.instagram && !site.facebook && <div className="text-muted">{t("Contact details coming soon.")}</div>}
        </div>
      </div>
      <div className="border-t border-line px-5 py-4 text-center text-[13px] text-muted2">
        {t("© {year} HAAD Fragrances. All rights reserved.", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
