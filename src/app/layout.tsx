import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/jost/400.css";
import "@fontsource/jost/500.css";
import "@fontsource/jost/600.css";
import "@fontsource/michroma/400.css";
import "@fontsource/aref-ruqaa/700.css";
import "@fontsource/noto-naskh-arabic/400.css";
import "@fontsource/noto-naskh-arabic/600.css";
import "@fontsource/noto-nastaliq-urdu/500.css";
import "@fontsource/noto-nastaliq-urdu/600.css";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { getUser } from "@/lib/auth";
import { db } from "@/db";
import { wishlist } from "@/db/schema";
import { eq } from "drizzle-orm";
import { siteUrl } from "@/lib/site";
import { getLang } from "@/lib/lang";
import { LangProvider } from "@/lib/lang-client";
import { translate } from "@/lib/i18n";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import BackToTop from "@/components/BackToTop";
import HashScroll from "@/components/HashScroll";
import SmoothScroll from "@/components/SmoothScroll";
import { ToastProvider } from "@/lib/toast";
import Footer from "@/components/Footer";

const description =
  "Rich, long-lasting perfumes for men and women. Free delivery across Pakistan. Cash on delivery available.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "HAAD Fragrances", template: "%s" },
  description,
  openGraph: {
    type: "website",
    siteName: "HAAD Fragrances",
    title: "HAAD Fragrances",
    description,
    locale: "en_PK",
    images: [{ url: "/images/haad-logo.jpg", alt: "HAAD Fragrances" }],
  },
  twitter: { card: "summary_large_image" },
};

// Sets the saved theme before the page paints, so there is no flash.
const themeScript = `try{var t=localStorage.getItem("haad-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const lang = await getLang();
  const user = await getUser().catch(() => null);
  const ids = user
    ? (await db.select({ id: wishlist.productId }).from(wishlist).where(eq(wishlist.userId, user.id))).map((r) => r.id)
    : [];
  return (
    <html lang={lang} dir={lang === "ur" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="bg-gold sr-only z-50 px-4 py-3 text-onacc focus:not-sr-only focus:fixed focus:start-3 focus:top-3">{translate(lang, "Skip to content")}</a>
        <div className="bg-gold px-5 py-2.5 text-center text-sm font-medium tracking-wide text-onacc">
          {translate(lang, "Free delivery across Pakistan")} &nbsp;·&nbsp; {translate(lang, "Cash on delivery available")}
        </div>
        <LangProvider lang={lang}>
        <CartProvider>
        <ToastProvider>
        <WishlistProvider initialIds={ids}>
          <Header />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
        <BackToTop />
        <SmoothScroll />
        <HashScroll />
        </WishlistProvider>
        </ToastProvider>
        </CartProvider>
        </LangProvider>
      </body>
    </html>
  );
}
