import type { Metadata } from "next";
import { OfferPageBody } from "../offer-page-body";

// Test route: the full offer page with the 3D engineering dossier, to
// review the integration before it replaces the timeline layout on /offer.
// Not linked from / or /offer and never indexed.
export const metadata: Metadata = {
  title: "Dossier de diagnostic — Jacques Maarek",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DossierPreviewPage() {
  return <OfferPageBody layout="dossier" />;
}
