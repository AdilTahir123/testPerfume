import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const list = await getActiveProducts();
  const pages = ["", "/shop", "/delivery", "/returns", "/privacy"].map((p) => ({ url: `${siteUrl}${p}` }));
  return [...pages, ...list.map((p) => ({ url: `${siteUrl}/product/${p.slug}` }))];
}
