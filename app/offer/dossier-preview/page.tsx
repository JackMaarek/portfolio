import type { Metadata } from "next";
import Link from "next/link";
import { Dossier } from "./dossier";
import styles from "./dossier.module.css";

// Test route: render check of the 3D engineering dossier. Not linked from
// / or /offer and never indexed.
export const metadata: Metadata = {
  title: "Dossier de diagnostic — Jacques Maarek",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DossierPreviewPage() {
  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#dossier-main">
        Aller au contenu
      </a>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          Jacques Maarek
        </Link>
        <Link href="/offer" className={styles.back}>
          L’offre
        </Link>
      </header>
      <main id="dossier-main" tabIndex={-1}>
        <Dossier />
      </main>
    </div>
  );
}
