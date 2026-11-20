import type { Metadata } from "next";
import { getT } from "@/lib/lang";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Delivery | HAAD Fragrances" };

// DRAFT text: the client must confirm the real delivery times before launch.
export default async function Delivery() {
  const t = await getT();
  return (
    <InfoPage title={t("Delivery")}>
      <p>{t("We deliver across Pakistan, and delivery is free on every order.")}</p>
      <h2>{t("How long it takes")}</h2>
      <p>{t("Orders are usually delivered within 3 to 5 working days. We will call or message you on the number you gave to confirm your order before it ships.")}</p>
      <h2>{t("Payment")}</h2>
      <p>{t("Pay cash to the rider when your parcel arrives, or choose bank transfer at checkout and we will send you our account details.")}</p>
      <h2>{t("Questions")}</h2>
      <p>{t("Message us on WhatsApp and we will help with your order.")}</p>
    </InfoPage>
  );
}
