import type { Metadata } from "next";
import { LiveSystem } from "../live-system/live-system";
import { OfferPageBody } from "../offer-page-body";

// Test route: the full offer page with the live system scene in place of
// section 05, to review the final render before it replaces the timeline.
export const metadata: Metadata = {
  title: "Le diagnostic — Jacques Maarek",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TracePreviewPage() {
  return <OfferPageBody diagnostic={<LiveSystem id="diagnostic" />} />;
}
