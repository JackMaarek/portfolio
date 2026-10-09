import { deliverables, painPoints, problemHeading, processSteps } from "../offer-content";

export const scene = { width: 400, height: 480 };

// Same delivery chain as the offer hero topology, laid out in portrait.
export const systemNodes = [
  { id: "code", label: "Code", x: 92, y: 64 },
  { id: "ci", label: "CI", x: 286, y: 116 },
  { id: "registry", label: "Registry", x: 112, y: 206 },
  { id: "argocd", label: "ArgoCD", x: 280, y: 274 },
  { id: "eks", label: "EKS", x: 120, y: 354 },
  { id: "metrics", label: "Metrics", x: 274, y: 424 },
] as const;

type NodeId = (typeof systemNodes)[number]["id"];

// Each offer pain point lights up on the node where it surfaces and is
// resolved by the diagnostic phase that covers it (phase 2 = J2, etc.).
export const systemAlerts: { node: NodeId; issue: string; resolvedAt: number; dx: number; dy: number }[] = [
  { node: "ci", issue: "Déploiements risqués", resolvedAt: 2, dx: -176, dy: 22 },
  { node: "registry", issue: "Rollbacks flous", resolvedAt: 2, dx: 30, dy: 6 },
  { node: "argocd", issue: "Environnements divergents", resolvedAt: 3, dx: -190, dy: 26 },
  { node: "metrics", issue: "Alertes inutiles", resolvedAt: 4, dx: -166, dy: 22 },
];

// Background mesh, drawn when the J1 mapping reveals the whole system.
export const meshPoints = [
  [36, 150], [370, 196], [210, 22], [40, 268], [372, 352], [52, 450], [208, 470],
];
const meshPairs: [number, NodeId][] = [
  [0, "code"], [0, "registry"], [1, "ci"], [1, "argocd"], [2, "code"], [2, "ci"], [3, "registry"],
  [3, "eks"], [4, "argocd"], [4, "metrics"], [5, "eks"], [6, "metrics"], [6, "eks"],
];
export const meshLinks = meshPairs.map(([point, nodeId]) => {
  const node = systemNodes.find((candidate) => candidate.id === nodeId)!;
  return [...meshPoints[point], node.x, node.y];
});

// Phase from which a node is healthy: once all of its alerts are resolved.
export const healthyAt = (nodeId: NodeId) =>
  Math.max(1, ...systemAlerts.filter((alert) => alert.node === nodeId).map((alert) => alert.resolvedAt));

// Smooth S-curve segments through the chain. A segment heals once both of
// its nodes are healthy; the packet follows the full route.
export const routeSegments = systemNodes.slice(1).map((node, index) => {
  const previous = systemNodes[index];
  const midY = (previous.y + node.y) / 2;
  return {
    key: `${previous.id}-${node.id}`,
    curve: `C ${previous.x} ${midY} ${node.x} ${midY} ${node.x} ${node.y}`,
    start: `M ${previous.x} ${previous.y}`,
    healthyAt: Math.max(healthyAt(previous.id), healthyAt(node.id)),
  };
});
export const routePath = [routeSegments[0].start, ...routeSegments.map((segment) => segment.curve)].join(" ");

const findTitle = <T extends { title: string }>(items: readonly T[], title: string) => {
  const item = items.find((candidate) => candidate.title === title);
  if (!item) throw new Error(`Unknown offer content title: ${title}`);
  return item;
};

type Camera = { x: number; y: number; scale: number };

const dayLinks: Record<string, { camera: Camera; issues: string[]; outputs: string[] }> = {
  J1: { camera: { x: 200, y: 240, scale: 1 }, issues: [], outputs: ["Cartographie"] },
  J2: { camera: { x: 196, y: 136, scale: 1.5 }, issues: ["Déploiements risqués", "Rollbacks flous"], outputs: ["Points de friction"] },
  J3: { camera: { x: 226, y: 314, scale: 1.45 }, issues: ["Environnements divergents"], outputs: [] },
  J4: { camera: { x: 220, y: 362, scale: 1.4 }, issues: ["Alertes inutiles"], outputs: [] },
  J5: { camera: { x: 200, y: 244, scale: 0.94 }, issues: [], outputs: ["Risques", "Quick wins", "Roadmap 30/60 jours", "Recommandations"] },
};

const incidentPhase = {
  key: "incident",
  kicker: problemHeading.label,
  title: problemHeading.title,
  body: problemHeading.accent,
  camera: { x: 200, y: 240, scale: 1 },
  issues: painPoints.map((point) => point.title),
  outputs: [] as { title: string; body: string }[],
};

export const phases = [
  incidentPhase,
  ...processSteps.map((step) => {
    const links = dayLinks[step.day];
    return {
      key: step.day,
      kicker: step.day,
      title: step.title,
      body: step.body,
      camera: links.camera,
      issues: links.issues.map((title) => findTitle(painPoints, title).title),
      outputs: links.outputs.map((title) => findTitle(deliverables, title)),
    };
  }),
];

export type Phase = (typeof phases)[number];
