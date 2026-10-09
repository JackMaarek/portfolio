// Offer copy shared by the offer page and the live system scene.
export const problemHeading = {
  label: "02 / Ce qui vous ralentit",
  title: "Les zones aveugles de la chaîne de delivery",
  accent: "concentrent l’essentiel du risque opérationnel.",
};

export const diagnosticHeading = {
  label: "05 / Le diagnostic",
  title: "Une analyse progressive de la chaîne de delivery,",
  accent: "du cadrage à la restitution.",
};

export const painPoints = [
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

export const processSteps = [
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

export const deliverables = [
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
