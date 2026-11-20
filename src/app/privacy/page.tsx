import type { Metadata } from "next";
import { getT } from "@/lib/lang";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Privacy policy | HAAD Fragrances" };

// DRAFT text: the client should have this checked before launch.
export default async function Privacy() {
  const t = await getT();
  return (
    <InfoPage title={t("Privacy policy")}>
      <p>{t("We only collect what we need to deliver your order: your name, phone number, address and, if you give it, your email.")}</p>
      <h2>{t("How we use it")}</h2>
      <p>{t("We use your details to confirm and deliver your order and to contact you about it. We do not sell your information.")}</p>
      <h2>{t("Your account")}</h2>
      <p>{t("If you create an account, your password is stored in a scrambled form that we cannot read. You can ask us to delete your account and details at any time.")}</p>
      <h2>{t("Cookies")}</h2>
      <p>{t("We use small files in your browser to keep you logged in, remember your cart and remember light or dark mode.")}</p>
    </InfoPage>
  );
}
