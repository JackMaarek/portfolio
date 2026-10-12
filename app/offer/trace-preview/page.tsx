import type { Metadata } from "next";
import { OfferPageBody } from "../offer-page-body";

// Test route: the full offer page in the trace layout, the alternative to
// the dossier layout shown on /offer.
export const metadata: Metadata = {
  title: "Le diagnostic — Jacques Maarek",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TracePreviewPage() {
  return <OfferPageBody layout="trace" />;
}
