// /projects/k8s-platform body: the hero with the isometric stack, the flow
// from commit to cluster, then the architecture on the light band.
import { SiteFooter } from "../../site-footer";
import { SiteHeader } from "../../site-header";
import { ArchitectureSection } from "./architecture-section";
import { CommitToClusterFlow } from "./commit-to-cluster-flow";
import { ProjectHero } from "./project-hero";

export function ProjectPageBody() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#project-main">Aller au contenu</a>
      <div className="noise" aria-hidden="true" />
      <SiteHeader page="project" />

      <main id="project-main" className="page-main" tabIndex={-1}>
        <ProjectHero />
        <CommitToClusterFlow />
        <ArchitectureSection />
      </main>

      <SiteFooter label="Contact" placement="project-contact" />
    </div>
  );
}
