import { IsoStack } from "./iso-stack";
import { projectPage } from "./k8s-platform-content";
import styles from "./project-hero.module.css";

export function ProjectHero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="project-title">
      <div className="hero-grid" aria-hidden="true" />
      <div className={styles.copy}>
        <p className="section-label">{projectPage.label}</p>
        <p className={styles.kicker}>{projectPage.kicker}</p>
        <h1 id="project-title">{projectPage.name}</h1>
        <p className={styles.lead}>{projectPage.lead}</p>
        <p className={styles.body}>{projectPage.body}</p>
        <dl className={styles.facts} aria-label="Chiffres clés">
          {projectPage.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.value}</dt>
              <dd>
                {fact.label}
                <br />
                {fact.detail}
              </dd>
            </div>
          ))}
        </dl>
        <div className={styles.actions}>
          <a
            className="hero-offer-link"
            href={projectPage.repository}
            target="_blank"
            rel="noreferrer"
            aria-label="Voir k8s-platform sur GitHub (nouvel onglet)"
          >
            <span>Voir sur GitHub</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a
            className={styles.secondary}
            href={projectPage.botRepository}
            target="_blank"
            rel="noreferrer"
            aria-label={`${projectPage.cli} sur GitHub (nouvel onglet)`}
          >
            {projectPage.cli} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <IsoStack />
    </section>
  );
}
