// Shop contact details. Set them in .env (see .env.example); anything left empty is hidden on the site.
export const site = {
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP || "923087475047").replace(/\D/g, ""), // digits only, like 923001234567
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK ?? "",
};

export function whatsappLink(text?: string) {
  if (!site.whatsapp) return "";
  return `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
