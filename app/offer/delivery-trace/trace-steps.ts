import { deliverables, painPoints, processSteps } from "../offer-content";

// Maps each diagnostic day to the pain points it addresses and the
// deliverables it produces. All copy comes from the offer content.
const stepLinks: Record<string, { issues: string[]; outputs: string[] }> = {
  J1: { issues: [], outputs: ["Cartographie"] },
  J2: { issues: ["Déploiements risqués", "Rollbacks flous"], outputs: ["Points de friction"] },
  J3: { issues: ["Environnements divergents"], outputs: [] },
  J4: { issues: ["Alertes inutiles"], outputs: [] },
  J5: { issues: [], outputs: ["Risques", "Quick wins", "Roadmap 30/60 jours", "Recommandations"] },
};

function pickByTitle<T extends { title: string }>(items: readonly T[], titles: string[]) {
  return titles.map((title) => {
    const item = items.find((candidate) => candidate.title === title);
    if (!item) throw new Error(`Unknown offer content title: ${title}`);
    return item;
  });
}

export const traceSteps = processSteps.map((step) => {
  const links = stepLinks[step.day] ?? { issues: [], outputs: [] };
  return {
    ...step,
    anchor: `trace-${step.day.toLowerCase()}`,
    issues: pickByTitle(painPoints, links.issues),
    outputs: pickByTitle(deliverables, links.outputs),
  };
});

export type TraceStep = (typeof traceSteps)[number];
