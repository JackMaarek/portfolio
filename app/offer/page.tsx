import type { Metadata } from "next";
import { getSiteOrigin, siteName } from "../site-metadata";
import { OfferPageBody, OfferProcess } from "./offer-page-body";

const offerTitle = "Offre Diagnostic CI/CD & Observabilité — Jacques Maarek";
const offerDescription =
  "Diagnostic court pour identifier ce qui fragilise vos déploiements, vos environnements et votre observabilité.";

export async function generateMetadata(): Promise<Metadata> {
  const origin = await getSiteOrigin();
  const image = `${origin}/og.png`;

  return {
    title: offerTitle,
    description: offerDescription,
    alternates: { canonical: `${origin}/offer` },
    openGraph: {
      title: offerTitle,
      description: offerDescription,
      type: "website",
      url: `${origin}/offer`,
      locale: "fr_FR",
      siteName,
      images: [{ url: image, width: 1200, height: 630, alt: offerTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: offerTitle,
      description: offerDescription,
      images: [image],
    },
  };
}

export default function OfferPage() {
  return <OfferPageBody diagnostic={<OfferProcess />} />;
}
