// Dossier pages: the offer copy (offer-content.ts) plus the audit detail of
// each day. The check lists are a draft awaiting Jacques' review before any
// use outside this noindex preview.
import {
  deliverables,
  diagnosticHeading,
  painPoints,
  problemHeading,
  processSteps,
} from "../offer-content";

export type NodeKey = "code" | "ci" | "registry" | "gitops" | "cluster" | "observability";

// Delivery chain, tool-agnostic with common tools as examples.
export const chainNodes: { key: NodeKey; label: string; examples: string }[] = [
  { key: "code", label: "Code", examples: "Git" },
  { key: "ci", label: "CI", examples: "GitHub Actions · GitLab CI" },
  { key: "registry", label: "Registry", examples: "Images & artefacts" },
  { key: "gitops", label: "GitOps", examples: "Argo CD · Flux" },
  { key: "cluster", label: "Cluster", examples: "EKS · GKE" },
  { key: "observability", label: "Observabilité", examples: "Prometheus · Grafana · Loki" },
];

type Check = { title: string; body: string };

export type DossierPage = {
  key: string;
  day?: string;
  title: string;
  body: string;
  focus: NodeKey[];
  checks: Check[];
  blindSpots: string[];
  outputs: { title: string; body: string }[];
};

const step = (day: string) => {
  const found = processSteps.find((candidate) => candidate.day === day);
  if (!found) throw new Error(`Unknown diagnostic day: ${day}`);
  return found;
};

const pick = <T extends { title: string }>(items: readonly T[], titles: string[]) =>
  titles.map((title) => {
    const item = items.find((candidate) => candidate.title === title);
    if (!item) throw new Error(`Unknown offer content title: ${title}`);
    return item;
  });

const dayPage = (
  day: string,
  key: string,
  focus: NodeKey[],
  checks: Check[],
  blindSpots: string[],
  outputs: string[],
): DossierPage => ({
  key,
  day,
  title: step(day).title,
  body: step(day).body,
  focus,
  checks,
  blindSpots: pick(painPoints, blindSpots).map((point) => point.title),
  outputs: pick(deliverables, outputs),
});

export const cover = {
  title: diagnosticHeading.title,
  accent: diagnosticHeading.accent,
  problem: `${problemHeading.title} ${problemHeading.accent}`,
  blindSpots: painPoints,
};

export const dossierPages: DossierPage[] = [
  {
    key: "cover",
    title: cover.title,
    body: cover.problem,
    focus: [],
    checks: [],
    blindSpots: [],
    outputs: [],
  },
  dayPage(
    "J1",
    "scoping",
    ["code", "ci", "registry", "gitops", "cluster", "observability"],
    [
      {
        title: "Entretiens ciblés",
        body: "CTO, Lead Dev et personnes d’astreinte : irritants, incidents récents, contraintes métier et calendrier de livraison.",
      },
      {
        title: "Le chemin réel d’un changement",
        body: "Dépôts, pipelines, registres, environnements et accès, cartographiés tels qu’ils sont pratiqués, pas tels qu’ils sont documentés.",
      },
      {
        title: "Mesure de référence",
        body: "Les quatre indicateurs DORA — fréquence de déploiement, délai de mise en production, taux d’échec des changements, temps de restauration — estimés à partir de l’historique disponible.",
      },
      {
        title: "Périmètre d’accès",
        body: "Dépôts, CI, cluster et outils d’observabilité : les accès nécessaires à l’analyse sont convenus avec vous pendant le cadrage.",
      },
    ],
    [],
    ["Cartographie"],
  ),
  dayPage(
    "J2",
    "cicd",
    ["code", "ci", "registry"],
    [
      {
        title: "Pipelines",
        body: "Durée, étapes, parallélisation et tests réellement bloquants ; repérage des tests instables qui banalisent l’échec.",
      },
      {
        title: "Artefacts et images",
        body: "Builds reproductibles, tags immuables plutôt que latest, versionnement et analyse de vulnérabilités avant publication.",
      },
      {
        title: "Secrets",
        body: "Stockage, rotation et exposition dans les logs ou les variables de CI ; fédération d’identité (OIDC) plutôt que clés statiques.",
      },
      {
        title: "Garde-fous et rollback",
        body: "Protections de branche, validations avant production et capacité réelle à redéployer la version précédente, mesurée.",
      },
    ],
    ["Déploiements risqués", "Rollbacks flous"],
    ["Points de friction"],
  ),
  dayPage(
    "J3",
    "kubernetes",
    ["gitops", "cluster"],
    [
      {
        title: "Manifests et charts Helm",
        body: "Requests et limits, probes, PodDisruptionBudgets, images épinglées : ce qui conditionne un déploiement sans interruption.",
      },
      {
        title: "Environnements",
        body: "Écarts entre dev, staging et production, valeurs par environnement et dérive entre Git et l’état réel du cluster.",
      },
      {
        title: "GitOps et promotion",
        body: "Source de vérité, synchronisation Argo CD ou Flux et stratégie de promotion d’un environnement à l’autre.",
      },
      {
        title: "Sécurité de base",
        body: "RBAC, Pod Security Standards et admission policies, confrontés aux contrôles du CIS Kubernetes Benchmark.",
      },
    ],
    ["Environnements divergents"],
    [],
  ),
  dayPage(
    "J4",
    "observability",
    ["cluster", "observability"],
    [
      {
        title: "Signaux essentiels",
        body: "Latence, trafic, erreurs et saturation — les golden signals SRE — mesurés sur les services critiques.",
      },
      {
        title: "Logs",
        body: "Centralisation, structure, rétention et corrélation avec les déploiements, pour relier un incident à un changement.",
      },
      {
        title: "Alertes",
        body: "Chaque alerte est-elle actionnable, liée à un symptôme utilisateur et accompagnée d’une procédure ? Le reste est du bruit.",
      },
      {
        title: "Dashboards et angles morts",
        body: "Les vues réellement consultées pendant un incident, et ce qu’aucune d’elles ne montre.",
      },
    ],
    ["Alertes inutiles"],
    [],
  ),
  dayPage(
    "J5",
    "report",
    [],
    [],
    [],
    ["Risques", "Quick wins", "Roadmap 30/60 jours", "Recommandations"],
  ),
];

// Blind spot surfaced on each node, pinned on the restitution page.
export const nodeFindings: Partial<Record<NodeKey, string>> = {
  ci: pick(painPoints, ["Déploiements risqués"])[0].title,
  registry: pick(painPoints, ["Rollbacks flous"])[0].title,
  gitops: pick(painPoints, ["Environnements divergents"])[0].title,
  observability: pick(painPoints, ["Alertes inutiles"])[0].title,
};
