import type { Metadata } from "next";
import { getSiteOrigin, siteName } from "../../site-metadata";
import { ProjectPageBody } from "./project-page-body";

const projectTitle = "k8s-platform, socle Kubernetes et GitOps sur AWS — Jacques Maarek";
const projectDescription =
  "Du service applicatif au workload ML/GPU : un socle Kubernetes et GitOps pour déployer simplement sur AWS, piloté par la CLI platform-bot.";

export async function generateMetadata(): Promise<Metadata> {
  const origin = await getSiteOrigin();
  const image = `${origin}/og.png`;

  return {
    title: projectTitle,
    description: projectDescription,
    alternates: { canonical: `${origin}/projects/k8s-platform` },
    openGraph: {
      title: projectTitle,
      description: projectDescription,
      type: "website",
      url: `${origin}/projects/k8s-platform`,
      locale: "fr_FR",
      siteName,
      images: [{ url: image, width: 1200, height: 630, alt: projectTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: projectTitle,
      description: projectDescription,
      images: [image],
    },
  };
}

export default function K8sPlatformProjectPage() {
  return <ProjectPageBody />;
}
