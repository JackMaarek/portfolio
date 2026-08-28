import type { Metadata } from "next";
import "./globals.css";
import { getSiteOrigin, siteName } from "./site-metadata";

const title = siteName;
const description =
  "Platform Engineer spécialisé Kubernetes, GitOps, Infrastructure as Code et plateformes AWS sécurisées.";

export async function generateMetadata(): Promise<Metadata> {
  const origin = await getSiteOrigin();
  const image = `${origin}/og.png`;

  return {
    title,
    description,
    alternates: { canonical: `${origin}/` },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${origin}/`,
      locale: "fr_FR",
      siteName,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
