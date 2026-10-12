import type { Metadata } from "next";
import { Portfolio } from "../portfolio";

// Test route: the full home page with the parcours column and the
// k8s-platform exploded view, to review before they replace the classic
// sections on /. Not linked from / or /offer and never indexed.
export const metadata: Metadata = {
  title: "Parcours — Jacques Maarek",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomePreviewPage() {
  return <Portfolio layout="parcours" />;
}
