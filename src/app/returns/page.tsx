import type { Metadata } from "next";
import { getT } from "@/lib/lang";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = { title: "Returns and refunds | HAAD Fragrances" };

// DRAFT text: the client must confirm the real return policy before launch.
export default async function Returns() {
  const t = await getT();
  return (
    <InfoPage title={t("Returns and refunds")}>
      <p>{t("We want you to be happy with your perfume. Because perfume is a personal item, we can only accept returns of unopened, sealed bottles.")}</p>
      <h2>{t("Damaged or wrong item")}</h2>
      <p>{t("If your parcel arrives damaged or you received the wrong perfume, message us on WhatsApp within 48 hours with a photo, and we will replace it.")}</p>
      <h2>{t("Refunds")}</h2>
      <p>{t("Approved refunds are returned in the same way you paid, within 7 working days.")}</p>
    </InfoPage>
  );
}
