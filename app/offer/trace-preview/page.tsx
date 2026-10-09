import type { Metadata } from "next";
import { SiteHeader } from "../../site-header";
import { LiveSystem } from "../live-system/live-system";
import styles from "./trace-preview.module.css";

// Test route: the live system scene in the offer context before it replaces
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
        <LiveSystem />
      </main>
    </div>
  );
}
