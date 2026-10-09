import { processSteps } from "../offer-content";
import { meshLinks, meshPoints, systemNodes } from "./live-system-data";

type Point = { x: number; y: number };

const node = (label: string): Point => {
  const match = systemNodes.find((candidate) => candidate.label === label);
  if (!match) throw new Error(`Unknown system node: ${label}`);
  return match;
};
const mesh = (index: number): Point => meshPoints[index];
const toPath = (points: Point[]) =>
  points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

// Before the diagnostic every hero mesh link is a candidate path. Each one
// settles into the background mesh once the day covering its area traces
// the real route (indexed like heroTopology.backgroundLinks).
const settleAt = [2, 3, 3, 2, 2, 2, 4, 4, 3, 3];
export const candidateLinks = meshLinks.map((link, index) => ({
  ...link,
  settleAt: settleAt[index] ?? 2,
}));

// Dead end outside the hero mesh: it vanishes once CI/CD is traced.
export const deadEnds = [{ from: mesh(0), to: mesh(3), removedAt: 2 }];

// Packets wandering through the unknown system: none reaches Metrics.
export const wanderingPaths = [
  toPath([node("Code"), mesh(1), mesh(2), node("EKS")]),
  toPath([node("Code"), node("CI"), mesh(0), mesh(3)]),
  toPath([node("Code"), node("CI"), node("Registry"), mesh(5)]),
  toPath([node("CI"), mesh(0), mesh(4), mesh(5), node("EKS")]),
];

// J4: the operational signal flows back from Metrics to the team's code.
export const feedbackLoop = "M 274 426 C 160 504, -4 404, 14 250 S 30 82, 60 50";

// Day annotation drawn at the head of the traced route.
const dayTagPositions: Record<string, Point> = {
  J1: { x: 104, y: 98 },
  J2: { x: 120, y: 236 },
  J3: { x: 176, y: 300 },
  J4: { x: 110, y: 414 },
};
export const dayTags = processSteps
  .filter((step) => step.day in dayTagPositions)
  .map((step) => ({ day: step.day, text: `${step.day} · ${step.title}`, ...dayTagPositions[step.day] }));
