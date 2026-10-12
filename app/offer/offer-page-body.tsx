// Shared /offer body. /offer uses the "dossier" layout: the hero is followed
// by the 3D engineering dossier, which carries sections 02, 05 and 06.
// "trace" (noindex preview) pins the live system scene behind the hero
// instead; "timeline" is the previous text-only layout.
import { BookingLink } from "../booking-link";
import { OfferMotion } from "../offer-motion";
import { SiteHeader } from "../site-header";
import { Dossier } from "./dossier/dossier";
import { heroTopology } from "./hero-topology";
import { LiveSystem } from "./live-system/live-system";
import {
  deliverables,
  diagnosticHeading,
  painPoints,
  problemHeading,
  processSteps,
  recommendationSteps,
} from "./offer-content";

export type OfferLayout = "timeline" | "trace" | "dossier";

// The trace layout carries sections 02 and 05 in the scene, merges the
// expected result with the deliverables (all listed by the scene) and moves
// the scope under the formats, so the sections after the scene move up.
type SectionKey = "result" | "formats" | "faq" | "contact";
const sectionNumbers: Record<OfferLayout, Record<SectionKey, string>> = {
  timeline: { result: "03", formats: "07", faq: "08", contact: "09" },
  trace: { result: "03", formats: "04", faq: "05", contact: "06" },
  dossier: { result: "03", formats: "04", faq: "05", contact: "06" },
};

const decisionOutcomes = [
  {
    horizon: "À la restitution",
    title: "Savoir où agir d’abord",
    body: "Les risques sont classés par impact, probabilité et effort de correction — pas par préférence d’outil.",
  },
  {
    horizon: "Prochaine mise en production",
    title: "Préparer le prochain déploiement",
    body: "Les garde-fous à vérifier, le chemin de rollback et les signaux à surveiller sont explicités.",
  },
  {
    horizon: "30 / 60 jours",
    title: "Piloter la remédiation",
    body: "Les actions sont séquencées avec leurs dépendances et un critère de réussite vérifiable.",
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

const plans = [
  {
    title: "Diagnostic court",
    duration: "3 jours",
    price: "À partir de 1 560 € HT",
    cta: "Échanger sur le périmètre",
    placement: "offer-short" as const,
    points: [
      "CI/CD et environnements",
      "Kubernetes / GitOps selon contexte",
      "Observabilité ciblée",
    ],
  },
  {
    title: "Diagnostic complet",
    duration: "5 jours",
    price: "À partir de 2 600 € HT",
    cta: "Planifier un diagnostic",
    placement: "offer-full" as const,
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

function OfferHeroCopy() {
  return (
    <>
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
        <div className="offer-hero-actions">
          <BookingLink
            className="offer-primary-link"
            placement="offer-hero"
            label="Planifier un échange"
          >
            Planifier un échange
            <span aria-hidden="true">→</span>
          </BookingLink>
          <a className="offer-secondary-link" href="#offer-content">
            Voir le diagnostic
          </a>
        </div>
      </div>
      <p className="offer-hero-foot">
        Intervention courte · plan d’action concret
      </p>
    </>
  );
}

function OfferProblem() {
  return (
    <section id="offer-content" className="offer-band offer-problem">
      <div className="offer-section-intro" data-offer-reveal="intro">
        <p className="offer-section-label">{problemHeading.label}</p>
        <h2>
          {problemHeading.title}
          <span>{` ${problemHeading.accent}`}</span>
        </h2>
      </div>
      <div className="offer-issue-grid" data-offer-reveal="content">
        {painPoints.map((point) => (
          <article className="offer-issue" key={point.index}>
            <span>{point.index}</span>
            <h3>{point.title}</h3>
            <p>{point.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function OfferProcess() {
  return (
    <section id="diagnostic" className="offer-band offer-process">
      <div className="offer-section-intro" data-offer-reveal="intro">
        <p className="offer-section-label">{diagnosticHeading.label}</p>
        <h2>
          {diagnosticHeading.title}
          <span>{` ${diagnosticHeading.accent}`}</span>
        </h2>
      </div>
      <div className="offer-timeline" data-offer-reveal="content">
        {processSteps.map((step) => (
          <article key={step.day}>
            <span>{step.day}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function OfferResult({ label }: { label: string }) {
  return (
    <section className="offer-band offer-promise">
      <div className="offer-section-intro" data-offer-reveal="intro">
        <p className="offer-section-label">{label}</p>
        <h2>
          Des constats traçables pour arbitrer les risques
          <span> et séquencer la remédiation.</span>
        </h2>
      </div>
      <div className="offer-decision-panel" data-offer-reveal="content">
        <div className="offer-decisions">
          {decisionOutcomes.map((outcome) => (
            <article key={outcome.title}>
              <p className="offer-decision-horizon">{outcome.horizon}</p>
              <h3>{outcome.title}</h3>
              <p>{outcome.body}</p>
            </article>
          ))}
        </div>
        <div className="offer-recommendation-model">
          <p className="offer-recommendation-label">
            Une recommandation traçable
          </p>
          <ol
            className="offer-recommendation-flow"
            aria-label="Construction d’une recommandation"
          >
            {recommendationSteps.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </li>
            ))}
          </ol>
          <p className="offer-recommendation-note">
            Chaque action proposée doit pouvoir être reliée à un fait observé,
            à son impact et à une priorité explicite.
          </p>
        </div>
      </div>
    </section>
  );
}

function OfferScope() {
  return (
    <section className="offer-band offer-scope">
      <div className="offer-section-intro" data-offer-reveal="intro">
        <p className="offer-section-label">04 / Périmètre</p>
        <h2>
          Un diagnostic volontairement cadré.
          <span> Pas un audit cloud généraliste.</span>
        </h2>
      </div>
      <OfferScopePanel reveal />
    </section>
  );
}

// Revealed on its own as a section; inside the formats note the note reveals.
function OfferScopePanel({ reveal = false }: { reveal?: boolean }) {
  return (
    <div className="offer-scope-panel" data-offer-reveal={reveal ? "content" : undefined}>
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
  );
}

function OfferDeliverables({ label }: { label: string }) {
  return (
    <section className="offer-band offer-deliverables">
      <div className="offer-section-intro" data-offer-reveal="intro">
        <p className="offer-section-label">{label}</p>
        <h2>
          Cartographie des risques
          <span> et plan de remédiation exploitable.</span>
        </h2>
      </div>
      <div className="offer-deliverable-grid" data-offer-reveal="content">
        {deliverables.map((item) => (
          <article className="offer-deliverable" key={item.index}>
            <span>{item.index}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function OfferFormats({ label, withScope }: { label: string; withScope: boolean }) {
  return (
    <section id="formats" className="offer-band offer-formats">
      <div className="offer-section-intro" data-offer-reveal="intro">
        <p className="offer-section-label">{label}</p>
        <h2>
          Deux niveaux d’analyse adaptés
          <span> à la maturité de votre chaîne de delivery.</span>
        </h2>
      </div>
      <div className="offer-plan-grid" data-offer-reveal="content">
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
            <BookingLink placement={plan.placement} label={plan.cta}>
              {plan.cta}
            </BookingLink>
          </article>
        ))}
      </div>
      <p className="offer-continuation" data-offer-reveal="content">
        Ensuite / sprint de remédiation · 10 à 20 jours · périmètre sur mesure
      </p>
      {withScope && (
        <div className="offer-scope-note" data-offer-reveal="content">
          <h3>
            Un diagnostic volontairement cadré.
            <span> Pas un audit cloud généraliste.</span>
          </h3>
          <OfferScopePanel />
        </div>
      )}
    </section>
  );
}

function OfferTopology() {
  const { nodes, backgroundNodes, backgroundLinks } = heroTopology;

  return (
    <svg
      className="offer-topology"
      viewBox="0 0 720 560"
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      <defs>
        <filter id="offer-topology-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="offer-route-gradient" x1="120" x2="640" y1="80" y2="500">
          <stop offset="0%" stopColor="rgba(255, 189, 116, .95)" />
          <stop offset="100%" stopColor="rgba(255, 189, 116, .62)" />
        </linearGradient>
      </defs>

      <g className="offer-topology-web">
        {backgroundLinks.map(([x1, y1, x2, y2]) => (
          <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>

      <g className="offer-topology-ghosts">
        {backgroundNodes.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />
        ))}
      </g>

      <polyline
        className="offer-topology-route"
        points="150,78 220,220 410,280 555,325 620,430 495,505"
      />

      <g className="offer-topology-nodes">
        {nodes.map((node) => (
          <g className="offer-topology-node" key={node.label} transform={`translate(${node.x} ${node.y})`}>
            <circle className="offer-node-halo" r="18" />
            <circle className="offer-node-ring" r="12" />
            <circle className="offer-node-core" r="6" />
            <g className="offer-node-label" transform={`translate(${node.dx} ${node.dy})`}>
              <rect x="0" y="-16" width={node.width} height="28" rx="3" />
              <text x="10" y="3">{node.label}</text>
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}

export function OfferPageBody({ layout }: { layout: OfferLayout }) {
  const number = sectionNumbers[layout];

  return (
    <div className="offer-shell">
      <OfferMotion />
      <a className="skip-link" href="#offer-main">
        Aller au contenu
      </a>
      <div className="noise" aria-hidden="true" />
      <SiteHeader page="offer" />

      <main id="offer-main" className="page-main" tabIndex={-1}>
        {layout === "trace" ? (
          <LiveSystem
            hero={
              <section className="offer-hero offer-hero-over-scene" id="top">
                <OfferHeroCopy />
              </section>
            }
          />
        ) : (
          <>
            <section className="offer-hero" id="top">
              <div className="hero-grid" aria-hidden="true" />
              <OfferTopology />
              <OfferHeroCopy />
            </section>
            {layout === "timeline" ? <OfferProblem /> : <Dossier />}
          </>
        )}

      {layout === "timeline" ? (
        <>
          <OfferResult label="03 / Le résultat attendu" />
          <OfferScope />
          <OfferProcess />
          <OfferDeliverables label="06 / Ce que vous obtenez" />
        </>
      ) : layout === "trace" ? (
        <OfferResult label={`${number.result} / Ce que vous obtenez`} />
      ) : (
        // The dossier's last sheet already lists what the client gets.
        <OfferResult label={`${number.result} / Le résultat attendu`} />
      )}

      <OfferFormats label={`${number.formats} / Formats`} withScope={layout !== "timeline"} />

      <section className="offer-faq">
        <p className="offer-section-label" data-offer-reveal="intro">
          {`${number.faq} / Questions fréquentes`}
        </p>
        {faqs.map((item) => (
          <details data-offer-reveal="content" key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
      </main>

      <footer id="contact" className="offer-contact">
        <div data-offer-reveal="intro">
          <p className="offer-section-label">{`${number.contact} / Contact`}</p>
          <h2>
            Parlons de votre
            <span> chaîne de delivery.</span>
          </h2>
          <p>Un échange de 30 minutes pour qualifier le périmètre.</p>
        </div>
        <BookingLink
          className="offer-contact-link"
          placement="offer-contact"
          label="Échanger sur votre contexte"
        >
          <span>Échanger sur votre contexte</span>
          <i aria-hidden="true">→</i>
        </BookingLink>
      </footer>
    </div>
  );
}
