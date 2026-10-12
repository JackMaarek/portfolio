import type { Metadata } from "next";
import { Portfolio } from "../portfolio";

// Test route: the full home page with the career stack scene, to review it
// before it replaces the classic sections on /. Not linked from / or /offer
// and never indexed.
export const metadata: Metadata = {
  title: "Parcours — Jacques Maarek",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomePreviewPage() {
  return <Portfolio layout="stack" />;
}
