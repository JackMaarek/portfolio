import { heroTopology } from "../hero-topology";
import { deliverables, painPoints, problemHeading, processSteps } from "../offer-content";

export const scene = { width: 400, height: 480 };

// Projects the landscape hero topology into the portrait scene.
const project = (x: number, y: number) => ({
  x: Math.round((x - 150) * 0.62 + 60),
  y: Math.round((y - 78) * 0.88 + 50),
});

// Portrait label offsets, chosen so each tag sits beside its own node.
const labelOffsets: Record<string, { dx: number; dy: number }> = {
  Code: { dx: 28, dy: -22 },
  CI: { dx: 30, dy: 8 },
  Registry: { dx: -60, dy: -44 },
  ArgoCD: { dx: 14, dy: -30 },
  EKS: { dx: -86, dy: -16 },
  Metrics: { dx: 28, dy: 34 },
};

export const systemNodes = heroTopology.nodes.map((node) => ({
  ...node,
  ...project(node.x, node.y),
  ...labelOffsets[node.label],
}));

export const meshPoints = heroTopology.backgroundNodes.map(([x, y]) => project(x, y));
export const meshLinks = heroTopology.backgroundLinks.map(([x1, y1, x2, y2]) => ({
  from: project(x1, y1),
  to: project(x2, y2),
}));

// Nodes each diagnostic day brings back to life.
const dayFocus: Record<string, string[]> = {
  J1: [],
  J2: ["Code", "CI", "Registry"],
  J3: ["ArgoCD", "EKS"],
  J4: ["Metrics"],
  J5: [],
};

// Offer pain point surfacing on each node until its day is diagnosed.
export const nodeIssues: Record<string, string> = {
  CI: "Déploiements risqués",
  Registry: "Rollbacks flous",
  ArgoCD: "Environnements divergents",
  Metrics: "Alertes inutiles",
};

const dayOutputs: Record<string, string[]> = {
  J1: ["Cartographie"],
  J2: ["Points de friction"],
  J3: [],
  J4: [],
  J5: ["Risques", "Quick wins", "Roadmap 30/60 jours", "Recommandations"],
};

const findTitle = <T extends { title: string }>(items: readonly T[], title: string) => {
  const item = items.find((candidate) => candidate.title === title);
  if (!item) throw new Error(`Unknown offer content title: ${title}`);
  return item;
};

export const phases = [
  {
    key: "incident",
    kicker: problemHeading.label,
    title: problemHeading.title,
    body: problemHeading.accent,
    focus: [] as string[],
    issues: painPoints.map((point) => point.title),
    outputs: [] as { title: string; body: string }[],
  },
  ...processSteps.map((step) => {
    const focus = dayFocus[step.day] ?? [];
    return {
      key: step.day,
      kicker: step.day,
      title: step.title,
      body: step.body,
      focus,
      issues: focus
        .filter((label) => label in nodeIssues)
        .map((label) => findTitle(painPoints, nodeIssues[label]).title),
      outputs: (dayOutputs[step.day] ?? []).map((title) => findTitle(deliverables, title)),
    };
  }),
];

export type Phase = (typeof phases)[number];

// Phase from which a node is lit: the first day whose focus includes it.
export const litAt = (label: string) => phases.findIndex((phase) => phase.focus.includes(label));

export const routePath = systemNodes
  .map((node, index) => `${index === 0 ? "M" : "L"} ${node.x} ${node.y}`)
  .join(" ");
