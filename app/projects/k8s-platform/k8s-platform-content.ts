// /projects/k8s-platform copy and diagram data. The diagrams are drawn from
// these structures; sensitive values (account ID, ARNs, endpoints) stay
// masked and the items marked `goal` are objectives, not shipped features.
import { project } from "../../home-content";

export const projectPage = {
  label: project.label,
  kicker: project.kicker,
  name: project.name,
  lead: project.lead,
  body: "platform-bot prépare chaque environnement de bout en bout : Terraform, branches GitOps, bootstrap du cluster. Chaque brique (maillage, secrets, politiques, observabilité) est un module : on l’ajoute ou on le retire sans toucher au reste.",
  facts: [
    { value: "3", label: "environnements", detail: "dev · staging · prod" },
    { value: "7", label: "modules", detail: "indépendants" },
    { value: "0", label: "clé AWS", detail: "statique" },
    { value: "1", label: "template", detail: "source de vérité" },
  ],
  repository: project.repository,
  botRepository: "https://github.com/PodYourLife/platform-botV2",
  cli: project.cli,
  stackLabel: "Architecture en cinq couches pilotées par platform-bot",
  stackHint: "Survolez une couche ou un principe",
};

// ---------- A — isometric stack ----------

// Plane units: x 0..14, y 0..8; heights in plates.
export type IsoBox = { x: number; y: number; w: number; d: number; h: number; accent?: boolean };
export type IsoTile = { x: number; y: number; w: number; d: number; accent?: boolean };
export type IsoText = { x: number; y: number; text: string; tone?: "strong" | "accent" };
export type IsoPoint = [x: number, y: number, z: number];

export type IsoLayer = {
  number: string;
  title: string;
  components: string;
  principle: string;
  why: string;
  outline?: { x: number; y: number; w: number; d: number };
  tiles: IsoTile[];
  texts: IsoText[];
  boxes: IsoBox[];
  links?: { from: IsoPoint; to: IsoPoint; dashed?: boolean }[];
  // ArgoCD's modules as a row of blocks; observability's metrics as bars.
  waves?: boolean;
  bars?: number[];
};

export const isoLayers: IsoLayer[] = [
  {
    number: "01",
    title: "Infrastructure décrite en code",
    components: "AWS · Terraform · GitHub OIDC",
    principle: "Tout est déclaré",
    why: "Modules atomiques, composés par domaine",
    outline: { x: 0.5, y: 0.5, w: 9.3, d: 3.9 },
    tiles: [
      { x: 1, y: 1, w: 2.6, d: 2.2 },
      { x: 4, y: 1, w: 2.6, d: 2.2 },
      { x: 7, y: 1, w: 2.5, d: 2.2 },
      { x: 0.5, y: 5, w: 4.6, d: 1.6 },
      { x: 5.4, y: 5, w: 4.4, d: 1.6, accent: true },
    ],
    texts: [
      { x: 1.2, y: 2.3, text: "subnet a" },
      { x: 4.2, y: 2.3, text: "subnet b" },
      { x: 7.2, y: 2.3, text: "subnet c" },
      { x: 0.6, y: 4.95, text: "VPC · eu-west-3", tone: "accent" },
      { x: 0.75, y: 6.0, text: "KMS · CloudTrail · GuardDuty" },
      { x: 5.6, y: 6.0, text: "IAM Identity Center", tone: "accent" },
      { x: 10.6, y: 2.85, text: "S3 · tfstate", tone: "strong" },
      { x: 10.6, y: 4.95, text: "DynamoDB · lock", tone: "strong" },
      { x: 10.6, y: 7.55, text: "GitHub OIDC", tone: "strong" },
    ],
    boxes: [
      { x: 10.6, y: 0.7, w: 1.8, d: 1.5, h: 1.3 },
      { x: 10.6, y: 3.4, w: 1.8, d: 1.0, h: 0.7 },
      { x: 10.6, y: 5.7, w: 1.8, d: 1.2, h: 1.0, accent: true },
    ],
  },
  {
    number: "02",
    title: "Kubernetes",
    components: "EKS 1.33 · node groups CPU / GPU",
    principle: "Un socle, trois environnements",
    why: "Clusters isolés, configuration identique",
    tiles: [
      { x: 0.8, y: 5, w: 2.6, d: 1.6 },
      { x: 3.7, y: 5, w: 3, d: 1.6 },
      { x: 7, y: 5, w: 2.8, d: 1.6 },
      { x: 10.1, y: 5, w: 2.9, d: 1.6, accent: true },
    ],
    texts: [
      { x: 0.8, y: 3.85, text: "EKS · control plane", tone: "strong" },
      { x: 4.8, y: 2.85, text: "ng-platform · CPU", tone: "strong" },
      { x: 10.2, y: 3.65, text: "ng-gpu · g4dn", tone: "accent" },
      { x: 1.05, y: 5.95, text: "argocd" },
      { x: 3.95, y: 5.95, text: "istio-system" },
      { x: 7.25, y: 5.95, text: "monitoring" },
      { x: 10.35, y: 5.95, text: "ml", tone: "accent" },
      { x: 0.8, y: 7.45, text: "namespaces" },
    ],
    boxes: [
      { x: 0.8, y: 0.8, w: 3, d: 2.4, h: 1.1 },
      { x: 4.8, y: 0.9, w: 1.3, d: 1.3, h: 0.8 },
      { x: 6.4, y: 0.9, w: 1.3, d: 1.3, h: 0.8 },
      { x: 8.0, y: 0.9, w: 1.3, d: 1.3, h: 0.8 },
      { x: 10.2, y: 0.8, w: 2.6, d: 2.2, h: 1.0, accent: true },
    ],
  },
  {
    number: "03",
    title: "Déploiements reproductibles",
    components: "GitOps · ArgoCD App-of-Apps · Helm",
    principle: "Git, seule source de vérité",
    why: "Le cluster suit sa branche, rien d’autre",
    tiles: [
      { x: 4.4, y: 0.8, w: 2.6, d: 1.2 },
      { x: 7.3, y: 0.8, w: 2.6, d: 1.2 },
      { x: 10.2, y: 0.8, w: 2.9, d: 1.2 },
    ],
    texts: [
      { x: 0.8, y: 3.95, text: "ArgoCD · App-of-Apps", tone: "strong" },
      { x: 4.6, y: 1.55, text: "platform" },
      { x: 7.5, y: 1.55, text: "ml" },
      { x: 10.4, y: 1.55, text: "applications" },
      { x: 4.4, y: 2.6, text: "AppProjects" },
      { x: 0.8, y: 6.55, text: "modules indépendants", tone: "accent" },
    ],
    boxes: [{ x: 0.8, y: 0.8, w: 2.8, d: 2.4, h: 1.4 }],
    waves: true,
  },
  {
    number: "04",
    title: "Sécurité",
    components: "Istio mTLS · Kyverno · External Secrets Operator",
    principle: "Sécurisé par défaut",
    why: "Zéro secret statique, mTLS partout",
    tiles: [{ x: 0.8, y: 4.6, w: 8.6, d: 1.6 }],
    texts: [
      { x: 0.8, y: 3.2, text: "Istio · mTLS STRICT", tone: "accent" },
      { x: 7.2, y: 3.85, text: "Kyverno", tone: "strong" },
      { x: 10.6, y: 2.8, text: "ESO ← IRSA", tone: "strong" },
      { x: 10.6, y: 6.7, text: "Secrets Manager", tone: "accent" },
      { x: 1.05, y: 5.55, text: "PeerAuthentication · ClusterPolicy · ExternalSecret" },
    ],
    boxes: [
      { x: 0.8, y: 1, w: 1.4, d: 1.4, h: 1.0 },
      { x: 4.2, y: 1, w: 1.4, d: 1.4, h: 1.0 },
      { x: 7.2, y: 0.8, w: 2.2, d: 2.4, h: 1.4 },
      { x: 10.6, y: 0.8, w: 1.8, d: 1.4, h: 1.0 },
      { x: 10.6, y: 4.6, w: 1.8, d: 1.4, h: 1.0, accent: true },
    ],
    links: [
      { from: [1.5, 1.7, 1.0], to: [4.9, 1.7, 1.0] },
      { from: [11.5, 1.5, 1.0], to: [11.5, 5.3, 1.0], dashed: true },
    ],
  },
  {
    number: "05",
    title: "Observabilité",
    components: "Prometheus · Grafana · Loki · OpenCost",
    principle: "Observable dès le premier jour",
    why: "Métriques, logs et coûts inclus",
    tiles: [{ x: 6.4, y: 0.8, w: 6.6, d: 3.4 }],
    texts: [
      { x: 0.8, y: 3.65, text: "Prometheus", tone: "strong" },
      { x: 3.6, y: 3.35, text: "Loki · Promtail", tone: "strong" },
      { x: 6.4, y: 4.9, text: "Grafana · dashboards", tone: "strong" },
      { x: 2.9, y: 6.05, text: "OpenCost", tone: "strong" },
    ],
    boxes: [
      { x: 0.8, y: 0.8, w: 2.2, d: 2.2, h: 1.2 },
      { x: 3.6, y: 0.8, w: 1.9, d: 1.9, h: 0.9 },
      { x: 0.8, y: 5, w: 1.8, d: 1.4, h: 0.7 },
    ],
    bars: [0.5, 0.8, 0.6, 1.1, 0.9, 1.4, 1.0],
  },
];

export const isoBot = { name: "platform-bot", detail: "CLI Go · Domain-Driven Design" };

// ---------- B — commit to cluster ----------

export type EnvName = "dev" | "staging" | "prod";

export const environments: Record<
  EnvName,
  { cluster: string; runtime: string; kyverno: "Audit" | "Enforce"; compliance: string; apply: string; version: string }
> = {
  dev: { cluster: "dev-k8s", runtime: "Kind (local) ou EKS eu-west-3", kyverno: "Audit", compliance: "none", apply: "appliquée en local", version: "82.4.2" },
  staging: { cluster: "staging-k8s", runtime: "EKS eu-west-3", kyverno: "Enforce", compliance: "soc2", apply: "appliquée par la CI (OIDC)", version: "82.4.2" },
  prod: { cluster: "prod-k8s", runtime: "EKS eu-west-3", kyverno: "Enforce", compliance: "soc2", apply: "appliquée par la CI (OIDC)", version: "82.4.2" },
};

export const envNames = Object.keys(environments) as EnvName[];

// A code line is a list of segments: `token` is resolved by platform-bot
// (__SNAKE_CASE__), `runtime` evaluated by ArgoCD ({{.camelCase}}).
export type CodeSegment = { text: string; kind?: "comment" | "token" | "runtime" };

export const templateCode: CodeSegment[][] = [
  [{ text: "# ApplicationSet prometheus", kind: "comment" }],
  [{ text: "elements:" }],
  [{ text: "- env: " }, { text: "__ENV__", kind: "token" }],
  [{ text: "  targetRevision:" }],
  [{ text: "    " }, { text: "__TARGET_REVISION__", kind: "token" }],
  [{ text: "  version:" }],
  [{ text: "    " }, { text: "__PROMETHEUS_VERSION__", kind: "token" }],
  [{ text: "# template", kind: "comment" }],
  [{ text: "name: '" }, { text: "prometheus-{{.env}}", kind: "runtime" }, { text: "'" }],
];

// The resolved branch keeps the template's keys; each value is shown as
// its token until the hydration resolves it.
export const resolvedKeys = [
  { key: "- env: ", token: "__ENV__", value: (env: EnvName) => env },
  { key: "  targetRevision: ", token: "__TARGET_REVISION__", value: (env: EnvName) => env },
  { key: "  version: ", token: "__PROMETHEUS_VERSION__", value: (env: EnvName) => environments[env].version },
];

export type TerminalLine = { kind: "prompt" | "ok"; text: string; note?: string };

export const terminalLines = (env: EnvName): TerminalLine[] => [
  { kind: "prompt", text: `platform-bot env hydrate --env ${env}` },
  { kind: "ok", text: `worktree ${env} ← main` },
  { kind: "ok", text: "tokens __*__ résolus", note: "(env, cluster, versions…)" },
  { kind: "ok", text: "backend.tf généré" },
  { kind: "prompt", text: `platform-bot env commit --env ${env}` },
  { kind: "prompt", text: `platform-bot env push --env ${env}` },
  { kind: "ok", text: `origin/${env}`, note: "à jour" },
];

export const syncWaves = [
  { name: "Namespaces", detail: "socle" },
  { name: "Istio", detail: "maillage mTLS" },
  { name: "External Secrets", detail: "secrets" },
  { name: "Observabilité", detail: "métriques · logs" },
  { name: "Kyverno", detail: "politiques" },
  { name: "OpenCost", detail: "coûts" },
  { name: "cert-manager", detail: "certificats" },
];

export const flow = {
  label: "Fonctionnement",
  title: "Du commit au cluster",
  // `main` and the placeholder are set as code in the intro.
  intro: {
    before: " est un template : chaque valeur propre à un environnement y reste un token ",
    after: ". platform-bot génère à partir de lui une branche par environnement, et ArgoCD ne lit que ces branches. Le cluster reflète toujours une branche reproductible.",
  },
  envLabel: "Environnement",
  replay: "rejouer",
  // Step 05 is titled with the selected cluster.
  steps: [
    { number: "01", who: "git · main", title: "Le template", body: "Jamais déployé. Les valeurs d’environnement restent des tokens." },
    { number: "02", who: "platform-bot", title: "L’hydratation", body: "La CLI résout les tokens depuis platform.yaml et le remote git, puis génère backend.tf." },
    { number: "03", who: "git · branche env", title: "La branche hydratée", body: "Gérée uniquement par le bot. Même main, même résultat." },
    { number: "04", who: "ArgoCD", title: "La synchronisation", body: "Chaque module est déployé séparément, dans l’ordre de ses dépendances. En retirer un ne casse pas les autres." },
    { number: "05", who: "cluster", title: null, body: "Le cluster reflète l’état de la branche, rien d’autre." },
  ],
  // Words of the step bodies set as code.
  codeWords: ["platform.yaml", "backend.tf", "main"],
  maskedApi: "https://••••••.gr7.eu-west-3.eks.amazonaws.com",
  syntax: [
    { code: "__SNAKE_CASE__", kind: "token" as const, title: "Résolu par platform-bot", body: { before: "Au moment de ", code: "env hydrate", after: ", avant le commit sur la branche d’environnement." } },
    { code: "{{.camelCase}}", kind: "runtime" as const, title: "Évalué par ArgoCD", body: { before: "Au runtime, depuis les générateurs des ApplicationSets. Les deux syntaxes cohabitent dans un même fichier.", code: "", after: "" } },
  ],
  rules: [
    "Aucune modification manuelle sur dev, staging ou prod",
    "Aucun token dans les fichiers *.tf",
    "Fonctionnalités : feat/* → PR → main, puis réhydratation",
  ],
};

// ---------- C — architecture ----------

export type Principle = { term: string; body: string; goal?: boolean; code?: string[] };

export const architecture = {
  label: "Architecture",
  title: "Modulaire par construction",
  intro: "L’infrastructure et la CLI suivent la même idée : de petites briques à responsabilité unique, assemblées par composition. Ajouter une brique ne demande pas de réécrire les autres.",
  terraform: {
    title: "Terraform",
    accent: "Atomic design",
    tag: "k8s-platform/terraform",
    body: "Les modules sont des atomes sans logique d’environnement. Chaque racine Terraform les assemble pour un rôle précis, avec son propre state. Un environnement complet est la somme de ces racines.",
    label: "Modules Terraform atomiques assemblés en racines puis en environnements",
    principles: [
      { term: "atome", body: "Une ressource AWS, une responsabilité, réutilisable dans toutes les racines." },
      { term: "molécule", body: "Une racine Terraform avec son state, appliquée indépendamment des autres." },
      { term: "organisme", body: "Un environnement : organization, socle partagé et domaine platform, répliqué pour dev, staging et prod." },
      { term: "dépendance", body: "Les domaines lisent le socle via remote state, jamais l’inverse. Aucun environnement ne lit le state d’un autre." },
      { term: "objectif", body: "Une nouvelle équipe = un nouveau dossier domains/, généré par le bot, sans toucher au reste.", goal: true, code: ["domains/"] },
    ] satisfies Principle[],
  },
  bot: {
    title: "platform-bot",
    accent: "Domain-Driven Design",
    tag: "Go · internal/",
    body: "Le cœur métier (valeurs de placeholders, résultats de plan et d’apply) ne dépend de rien. Chaque outil externe vit dans son propre package, et les commandes se limitent au câblage.",
    label: "Couches concentriques de platform-bot, dépendances orientées vers le domaine",
    caption: "Les dépendances pointent vers le centre. Le domaine ne connaît aucune couche externe.",
    principles: [
      { term: "domain/", body: "Types purs, zéro import, partagés par toutes les couches." },
      { term: "orchestration", body: "envsetup et bootstrap enchaînent les cas d’usage.", code: ["envsetup", "bootstrap"] },
      { term: "adaptateurs", body: "Un package par outil : terraform-exec, go-git, Helm, Kind, API GitHub." },
      { term: "cmd/", body: "Câblage Cobra uniquement, 50 lignes max par fichier." },
      { term: "objectif", body: "Des ports séparés par responsabilité (Git, hydratation, secrets) plutôt qu’une interface fourre-tout.", goal: true },
    ] satisfies Principle[],
  },
};

// Terraform diagram, in viewBox units (780 × 440).
export type MoleculeKey = "org" | "shared" | "platform";

export const terraformAtoms: { name: string; y: number; molecules: MoleculeKey[] }[] = [
  { name: "identity-center-bootstrap", y: 52, molecules: ["org"] },
  { name: "identity-center-assignment", y: 82, molecules: ["org"] },
  { name: "vpc", y: 126, molecules: ["shared"] },
  { name: "eks", y: 156, molecules: ["shared"] },
  { name: "github-oidc", y: 186, molecules: ["shared"] },
  { name: "irsa", y: 336, molecules: ["shared", "platform"] },
  { name: "nodegroup", y: 384, molecules: ["platform"] },
];

// A folder of five atoms, all read by the shared root.
export const complianceAtoms = ["kms", "cloudtrail", "guardduty", "vpc-flow-logs", "aws-config"];

export const terraformMolecules: Record<MoleculeKey, { y: number; h: number; title: string; body: string; state: string }> = {
  org: { y: 44, h: 70, title: "domains/organization", body: "Accès humains (Identity Center)", state: "1 fois · compte de gestion" },
  shared: { y: 178, h: 80, title: "_core/shared/{env}", body: "Socle : VPC, EKS, OIDC, conformité", state: "1 state par environnement" },
  platform: { y: 338, h: 70, title: "domains/platform/{env}", body: "Calcul : node groups, IRSA", state: "1 state par environnement" },
};

export const terraformColumns = [
  { title: "ATOMES", detail: "_core/modules/aws" },
  { title: "MOLÉCULES", detail: "racines" },
  { title: "ORGANISME", detail: "environnement" },
];

export const terraformOrganism = {
  title: "Environnement",
  roots: ["organization", "+ shared/dev", "+ platform/dev"],
  count: "× 3 · dev · staging · prod",
  remoteState: "remote state",
  goal: { title: "domains/{équipe}", body: "Un dossier de plus, rien d’autre", tag: "objectif" },
};

// platform-bot rings, outer to inner, in viewBox units (520 × 520).
export const botRings = [
  { label: "ENTRÉES", radius: 252 },
  { label: "ADAPTATEURS", radius: 200 },
  { label: "ORCHESTRATION", radius: 136 },
  { label: "DOMAINE", radius: 72 },
];

export const botDomain = { name: "domain/", types: ["PlaceholderValues", "PlanSummary", "ApplyOutcome"] };

// Packages placed on their ring: `radius` and `angle` (degrees, clockwise from 3 o'clock).
export type BotPackage = { name: string; radius: number; angle: number; layer: "orchestration" | "adapter" | "entry" };

export const botPackages: BotPackage[] = [
  { name: "envsetup", radius: 106, angle: 120, layer: "orchestration" },
  { name: "bootstrap", radius: 106, angle: 60, layer: "orchestration" },
  { name: "platform", radius: 110, angle: 200, layer: "orchestration" },
  ...["terraform", "gitops", "kind", "helm", "kubernetes", "github", "awssecrets", "prereq"].map(
    (name, index): BotPackage => ({ name, radius: 168, angle: -52 + index * 37.5, layer: "adapter" }),
  ),
  { name: "cmd/", radius: 226, angle: 215, layer: "entry" },
  { name: "tui/", radius: 226, angle: 325, layer: "entry" },
  { name: "ui/", radius: 226, angle: 90, layer: "entry" },
];
