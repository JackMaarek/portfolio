import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const contactHref =
  "mailto:jacques.maarek.dev@gmail.com?subject=Diagnostic%20CI%2FCD%20%26%20Observabilit%C3%A9";

const painPoints = [
  {
    index: "01",
    title: "Déploiements risqués",
    body: "Absence de garde-fou et de visibilité sur l’état réel de vos déploiements.",
  },
  {
    index: "02",
    title: "Rollbacks flous",
    body: "Pas de trajectoire fiable pour revenir à un état sain en confiance.",
  },
  {
    index: "03",
    title: "Environnements divergents",
    body: "Des environnements qui dérivent et masquent les vrais problèmes.",
  },
  {
    index: "04",
    title: "Alertes inutiles",
    body: "Trop de bruit, pas de signal : l’équipe passe à côté de l’essentiel.",
  },
];

const outcomes = [
  {
    title: "Lisibilité",
    body: "Voir où la chaîne casse.",
  },
  {
    title: "Fiabilité",
    body: "Réduire le risque opérationnel.",
  },
  {
    title: "Opérabilité",
    body: "Diagnostiquer plus vite.",
  },
];

const scopeItems = [
  "CI/CD",
  "Docker",
  "Kubernetes delivery",
  "GitOps",
  "Logs, métriques et dashboards",
  "Alerting de base",
  "Documentation opérationnelle",
  "Dette de delivery",
];

const processSteps = [
  {
    day: "J1",
    title: "Cadrage",
    body: "Contexte, irritants, incidents récents et cartographie de haut niveau.",
  },
  {
    day: "J2",
    title: "CI/CD",
    body: "Pipelines, tests, packaging, secrets, validations et capacité de rollback.",
  },
  {
    day: "J3",
    title: "Kubernetes & GitOps",
    body: "Manifests, Helm, environnements, ArgoCD et stratégie de promotion.",
  },
  {
    day: "J4",
    title: "Observabilité",
    body: "Logs, métriques, dashboards, alertes, angles morts et bruit opérationnel.",
  },
  {
    day: "J5",
    title: "Restitution",
    body: "Risques, quick wins, recommandations et roadmap 30/60 jours.",
  },
];

const deliverables = [
  {
    index: "01",
    title: "Cartographie",
    body: "Du code à la production.",
  },
  {
    index: "02",
    title: "Points de friction",
    body: "Ce qui ralentit le delivery.",
  },
  {
    index: "03",
    title: "Risques",
    body: "Classés par criticité.",
  },
  {
    index: "04",
    title: "Quick wins",
    body: "Actions simples à fort impact.",
  },
  {
    index: "05",
    title: "Roadmap 30/60 jours",
    body: "Priorisée et actionnable.",
  },
  {
    index: "06",
    title: "Recommandations",
    body: "Techniques et concrètes.",
  },
];

const plans = [
  {
    title: "Diagnostic court",
    duration: "3 jours",
    price: "À partir de 2 500 € HT",
    cta: "Échanger sur le périmètre",
    points: [
      "CI/CD et environnements",
      "Kubernetes / GitOps selon contexte",
      "Observabilité ciblée",
    ],
  },
  {
    title: "Diagnostic complet",
    duration: "5 jours",
    price: "À partir de 3 900 € HT",
    cta: "Planifier un diagnostic",
    recommended: true,
    points: [
      "CI/CD et chaîne de delivery",
      "Kubernetes & GitOps",
      "Logs, métriques, dashboards & alertes",
      "Restitution + roadmap 30/60 jours",
    ],
  },
];

const faqs = [
  {
    question: "Avons-nous besoin de Kubernetes ?",
    answer:
      "Non. Kubernetes est fréquent dans ce type de mission, mais le diagnostic peut aussi s’appliquer à une stack Docker, CI/CD et cloud plus classique.",
  },
  {
    question: "L’équipe interne peut-elle exécuter la roadmap ?",
    answer:
      "Oui. Le livrable est pensé pour être exploitable par votre CTO, Lead Dev ou équipe technique, avec ou sans accompagnement ensuite.",
  },
  {
    question: "Que se passe-t-il après le diagnostic ?",
    answer:
      "Vous pouvez exécuter en interne, lancer un sprint de remédiation ciblé ou mettre en place un accompagnement récurrent de quelques jours par mois.",
  },
];

export const metadata: Metadata = {
  title: "Offre Diagnostic CI/CD & Observabilité — Jacques Maarek",
  description:
    "Diagnostic court pour identifier ce qui fragilise vos déploiements, vos environnements et votre observabilité.",
};

function OfferHeader() {
  return (
    <header className="offer-topbar">
      <Link className="monogram" href="/" aria-label="Retour à la landing page">
        <Image
          src="/logo-jm-header.png"
          alt=""
          width={48}
          height={48}
          priority
          unoptimized
        />
      </Link>
      <div className="status">
        <span className="status-dot" />
        Disponible pour missions freelance
      </div>
      <nav className="offer-nav" aria-label="Navigation offre">
        <Link href="/#expertise">Expertise</Link>
        <Link href="/#experience">Expérience</Link>
        <Link className="offer-nav-active" href="/offer" aria-current="page">
          Offre
        </Link>
        <Link href="/#projects">Projets</Link>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

function OfferTopology() {
  const nodes = [
    { label: "Code", className: "node-code" },
    { label: "CI", className: "node-ci" },
    { label: "Registry", className: "node-registry" },
    { label: "ArgoCD", className: "node-argocd" },
    { label: "EKS", className: "node-eks" },
    { label: "Metrics", className: "node-metrics" },
  ];

  return (
    <div className="offer-topology" aria-hidden="true">
      <div className="offer-route-line" />
      {nodes.map((node) => (
        <span
          className={`offer-node ${node.className}`}
          key={node.label}
          data-label={node.label}
        />
      ))}
    </div>
  );
}

export default function OfferPage() {
  return (
    <main className="offer-shell">
      <a className="skip-link" href="#offer-content">
        Aller au contenu
      </a>
      <div className="noise" aria-hidden="true" />
      <OfferHeader />

      <section className="offer-hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <OfferTopology />
        <div className="offer-hero-copy">
          <p className="offer-section-label">01 / Diagnostic CI/CD & Observabilité</p>
          <h1>
            Vos déploiements,
            <span> enfin lisibles.</span>
          </h1>
          <p>
            En 3 à 5 jours, j’identifie ce qui fragilise votre delivery et ce
            qui ralentit le diagnostic de vos incidents.
          </p>
          <ul className="offer-hero-tags" aria-label="Périmètre du diagnostic">
            <li>CI/CD</li>
            <li>Kubernetes</li>
            <li>GitOps</li>
            <li>Logs</li>
            <li>Métriques</li>
            <li>Alerting</li>
          </ul>
          <a className="offer-primary-link" href="#formats">
            Découvrir le diagnostic
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <p className="offer-hero-foot">
          Intervention courte · plan d’action concret
        </p>
      </section>

      <section id="offer-content" className="offer-band offer-problem">
        <div className="offer-section-intro">
          <p className="offer-section-label">02 / Ce qui vous ralentit</p>
          <h2>
            Le problème n’est pas vos outils.
            <span> C’est ce qu’on ne voit plus.</span>
          </h2>
        </div>
        <div className="offer-issue-grid">
          {painPoints.map((point) => (
            <article className="offer-issue" key={point.index}>
              <span>{point.index}</span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="offer-band offer-promise">
        <div className="offer-section-intro">
          <p className="offer-section-label">03 / La promesse</p>
          <h2>
            En 3 à 5 jours,
            <span> une vision claire, priorisée et actionnable.</span>
          </h2>
        </div>
        <div className="offer-outcomes">
          {outcomes.map((outcome) => (
            <article key={outcome.title}>
              <h3>{outcome.title}</h3>
              <p>{outcome.body}</p>
            </article>
          ))}
        </div>
        <div className="offer-flow" aria-label="Flux analysé">
          {["Code", "CI", "Registry", "ArgoCD", "EKS"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="offer-band offer-scope">
        <div className="offer-section-intro">
          <p className="offer-section-label">04 / Périmètre</p>
          <h2>
            Un diagnostic volontairement cadré.
            <span> Pas un audit cloud généraliste.</span>
          </h2>
        </div>
        <div className="offer-scope-panel">
          <ul aria-label="Sujets inclus">
            {scopeItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <aside>
            Le diagnostic peut faire remonter des signaux de risque sur la
            sécurité, le réseau, le FinOps ou l’architecture cloud avancée, mais
            il ne remplace pas une intervention spécialisée sur ces sujets.
          </aside>
        </div>
      </section>

      <section className="offer-band offer-process">
        <div className="offer-section-intro">
          <p className="offer-section-label">05 / Le diagnostic</p>
          <h2>
            Comprendre.
            <span> Prioriser. Agir.</span>
          </h2>
        </div>
        <div className="offer-timeline">
          {processSteps.map((step) => (
            <article key={step.day}>
              <span>{step.day}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="offer-band offer-deliverables">
        <div className="offer-section-intro">
          <p className="offer-section-label">06 / Ce que vous obtenez</p>
          <h2>
            Clair.
            <span> Priorisé. Actionnable.</span>
          </h2>
        </div>
        <div className="offer-deliverable-grid">
          {deliverables.map((item) => (
            <article className="offer-deliverable" key={item.index}>
              <span>{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="formats" className="offer-band offer-formats">
        <div className="offer-section-intro">
          <p className="offer-section-label">07 / Formats</p>
          <h2>
            Choisir le bon niveau
            <span> de profondeur.</span>
          </h2>
        </div>
        <div className="offer-plan-grid">
          {plans.map((plan) => (
            <article
              className={
                plan.recommended ? "offer-plan recommended" : "offer-plan"
              }
              key={plan.title}
            >
              {plan.recommended ? <span className="offer-badge">Recommandé</span> : null}
              <h3>{plan.title}</h3>
              <strong>{plan.duration}</strong>
              <p>{plan.price}</p>
              <ul>
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <a href={contactHref}>{plan.cta}</a>
            </article>
          ))}
        </div>
        <p className="offer-continuation">
          Ensuite / sprint de remédiation · 10 à 20 jours · périmètre sur mesure
        </p>
      </section>

      <section className="offer-faq">
        <p className="offer-section-label">08 / Questions fréquentes</p>
        {faqs.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>

      <footer id="contact" className="offer-contact">
        <div>
          <p className="offer-section-label">09 / Contact</p>
          <h2>
            Parlons de votre
            <span> chaîne de delivery.</span>
          </h2>
          <p>Un échange de 30 minutes pour qualifier le périmètre.</p>
        </div>
        <a href={contactHref} aria-label="Contacter Jacques Maarek">
          →
        </a>
      </footer>
    </main>
  );
}
