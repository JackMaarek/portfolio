import type { Metadata } from "next";
import { SiteHeader } from "../../site-header";
import { DeliveryTrace } from "../delivery-trace/delivery-trace";
import styles from "./trace-preview.module.css";

// Test route: the delivery trace in the offer context before it replaces
// section 05 of the offer page.
export const metadata: Metadata = {
  title: "Le diagnostic — Jacques Maarek",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TracePreviewPage() {
  return (
    <div className="offer-shell">
      <div className={styles.headerStrip}>
        <SiteHeader page="offer" />
      </div>
      <main>
        <DeliveryTrace />
      </main>
    </div>
  );
}
