import { heroTopology } from "../hero-topology";
import {
  deliverables,
  diagnosticHeading,
  painPoints,
  problemHeading,
  processSteps,
} from "../offer-content";

export const scene = { width: 400, height: 480 };

// Projects the landscape hero topology into the portrait scene.
const project = (x: number, y: number) => ({
  x: Math.round((x - 150) * 0.62 + 60),
  y: Math.round((y - 78) * 0.88 + 50),
});

// Portrait label offsets, chosen so each tag sits beside its own node.
const labelOffsets: Record<string, { dx: number; dy: number }> = {
  Code: { dx: 14, dy: -16 },
  CI: { dx: -46, dy: 0 },
  Registry: { dx: 10, dy: -22 },
  ArgoCD: { dx: 10, dy: -22 },
  EKS: { dx: -54, dy: -12 },
  Metrics: { dx: 12, dy: 22 },
};

// Label boxes are drawn smaller than in the hero to keep the scene light.
const labelScale = 0.8;

export const systemNodes = heroTopology.nodes.map((node) => ({
  ...node,
  ...project(node.x, node.y),
  ...labelOffsets[node.label],
  width: Math.round(node.width * labelScale),
}));

export const meshPoints = heroTopology.backgroundNodes.map(([x, y]) => project(x, y));
export const meshLinks = heroTopology.backgroundLinks.map(([x1, y1, x2, y2]) => ({
  from: project(x1, y1),
  to: project(x2, y2),
}));

// Route section each diagnostic day traces, as the nodes it reaches.
const dayFocus: Record<string, string[]> = {
  J1: [],
  J2: ["Code", "CI", "Registry"],
  J3: ["ArgoCD", "EKS"],
  J4: ["Metrics"],
  J5: [],
};

// Offer pain point surfacing on each node; it becomes a finding once traced.
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

// Section name without its /offer number: the scene carries it for J1–J5.
const diagnosticName = diagnosticHeading.label.replace(/^\d+ \/ /, "");

const findTitle = <T extends { title: string }>(items: readonly T[], title: string) => {
  const item = items.find((candidate) => candidate.title === title);
  if (!item) throw new Error(`Unknown offer content title: ${title}`);
  return item;
};

// Scroll share of each phase: J1 and J5 carry less than the traced days.
const dayWeights: Record<string, number> = { J1: 0.6, J5: 0.8 };

export const phases = [
  {
    key: "incident",
    weight: 1.1,
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
      weight: dayWeights[step.day] ?? 1,
      kicker: `${diagnosticName} · ${step.day}`,
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

// Phase from which a node is traced: the first day whose section includes it.
export const litAt = (label: string) => phases.findIndex((phase) => phase.focus.includes(label));

// Pen speed of the traced route, in scene units per millisecond.
const traceSpeed = 0.2;

// Route segments in delivery order. A segment is traced on the phase that
// lights its second node; within a phase segments are chained, each one
// starting when the previous one ends, so the route reads as one stroke.
export const routeSegments = systemNodes.slice(1).map((node, index) => {
  const from = systemNodes[index];
  return {
    from,
    to: node,
    tracedAt: Math.max(litAt(from.label), litAt(node.label)),
    duration: Math.round(Math.hypot(node.x - from.x, node.y - from.y) / traceSpeed),
    delay: 0,
  };
});
routeSegments.forEach((segment, index) => {
  const previous = routeSegments[index - 1];
  if (previous && previous.tracedAt === segment.tracedAt) {
    segment.delay = previous.delay + previous.duration;
  }
});

// When the pen reaches each node: the node lights up at that moment.
export const nodeArrival = Object.fromEntries(
  routeSegments
    .filter((segment) => segment.tracedAt === litAt(segment.to.label))
    .map((segment) => [segment.to.label, segment.delay + segment.duration]),
) as Record<string, number>;

export const routePath = systemNodes
  .map((node, index) => `${index === 0 ? "M" : "L"} ${node.x} ${node.y}`)
  .join(" ");
