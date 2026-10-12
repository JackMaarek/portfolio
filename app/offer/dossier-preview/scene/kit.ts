// Shared vocabulary of the dossier scene: palette, chain layout, the route
// the changes travel, HTML labels and the contract each day's feature follows.
import { Color, LineCurve3, MathUtils, Vector3, type Scene } from "three";
import type { NodeKey } from "../dossier-content";

export const palette = {
  ink: new Color("#0b0b0d"),
  puck: new Color("#18171d"),
  idle: new Color("#5d5a68"),
  paper: new Color("#efedf5"),
  amber: new Color("#ffbd74"),
  violet: new Color("#aba2ff"),
};

// Chain layout on the floor (x, z), left to right in delivery order.
export const layout: Record<NodeKey, { x: number; z: number; radius: number }> = {
  code: { x: -5.6, z: -1, radius: 0.5 },
  ci: { x: -3.5, z: 1.2, radius: 0.5 },
  registry: { x: -1.3, z: -0.5, radius: 0.5 },
  gitops: { x: 0.9, z: 1.4, radius: 0.55 },
  cluster: { x: 3.4, z: -0.2, radius: 0.85 },
  observability: { x: 5.7, z: 1.7, radius: 0.55 },
};

export const order: NodeKey[] = ["code", "ci", "registry", "gitops", "cluster", "observability"];

// Height of a puck's top face.
export const puckTop = 0.262;

export const point = (key: NodeKey, y = 0.14) => new Vector3(layout[key].x, y, layout[key].z);

export const smoothstep = (edge0: number, edge1: number, value: number) =>
  MathUtils.smoothstep(value, edge0, edge1);

// The route a change follows, as one parametric path over the whole chain.
export function createRoute() {
  const curves = order.slice(1).map((key, index) => new LineCurve3(point(order[index]), point(key)));
  const lengths = curves.map((curve) => curve.getLength());
  const total = lengths.reduce((sum, length) => sum + length, 0);

  return {
    curves,
    total,
    // Point at route parameter t (0 = Code, 1 = Observabilité).
    at(t: number, target: Vector3) {
      let distance = t * total;
      for (let index = 0; index < curves.length; index += 1) {
        if (distance <= lengths[index] || index === curves.length - 1) {
          return curves[index].getPointAt(Math.min(distance / lengths[index], 1), target);
        }
        distance -= lengths[index];
      }
      return target;
    },
    // Route parameter of the fraction f along segment `segment`.
    tOf(segment: number, f: number) {
      const before = lengths.slice(0, segment).reduce((sum, length) => sum + length, 0);
      return (before + f * lengths[segment]) / total;
    },
  };
}

export type Route = ReturnType<typeof createRoute>;

export type LabelTone = "node" | "tag" | "finding" | "axis";

// Findings first, then the parts a day opens, which name the day's own
// representation and so outrank even an audited node in focus (raised by
// 2), then axes and nodes at rest.
const tonePriority: Record<LabelTone, number> = { finding: 4.5, tag: 3.2, axis: 1.5, node: 1 };

// Where a label sits relative to its anchor.
export type LabelSpot = "below" | "above" | "right" | "left";

// Nothing is shown unexplained: a secondary element follows its label,
// easing out while the label has no room and back in once it is placed.
export const followLabel = (label: SceneLabel, current: number, reduced: boolean) => {
  const target = label.placed ? 1 : 0;
  return reduced ? target : current + (target - current) * 0.12;
};

export type LabelClassNames = Record<LabelTone, string> & { label: string; name: string; meta: string };

export type SceneLabel = {
  element: HTMLDivElement;
  anchor: Vector3;
  // Feature-controlled visibility, multiplied by the in-frame check.
  alpha: number;
  // Spots around the anchor in order of preference; the fallback anchor,
  // when set, is tried (above it) right after the first spot.
  spots: LabelSpot[];
  alt?: Vector3;
  // Whether the last layout found the label a free spot.
  placed: boolean;
  // When two labels collide, the higher priority one is kept.
  priority: number;
  // Dropped on the phone band, where the frame is too small for it.
  phone: boolean;
  width: number;
  height: number;
};

export function createLabels(layer: HTMLElement, classNames: LabelClassNames) {
  const labels: SceneLabel[] = [];

  const add = (
    name: string,
    options: { meta?: string; tone?: LabelTone; above?: boolean; phone?: boolean; spots?: LabelSpot[] } = {},
  ) => {
    const { meta, tone = "node", above = false, phone = true } = options;
    // Beside the anchor is the last resort when the preferred side is taken.
    const spots = options.spots ?? [above ? "above" : "below", "right", "left"];
    const element = document.createElement("div");
    element.className = `${classNames.label} ${classNames[tone]}`;
    const nameElement = document.createElement("span");
    nameElement.className = classNames.name;
    nameElement.textContent = name;
    element.append(nameElement);
    if (meta !== undefined) {
      const metaElement = document.createElement("span");
      metaElement.className = classNames.meta;
      metaElement.textContent = meta;
      element.append(metaElement);
    }
    layer.append(element);
    const label: SceneLabel = {
      element,
      anchor: new Vector3(),
      alpha: 0,
      spots,
      placed: false,
      phone,
      width: 0,
      height: 0,
      priority: tonePriority[tone],
    };
    labels.push(label);
    return label;
  };

  // Label sizes are read once per layout change, never inside the frame.
  const measure = () => {
    for (const label of labels) {
      label.width = label.element.offsetWidth;
      label.height = label.element.offsetHeight;
    }
  };

  return { labels, add, measure };
}

export type Labels = ReturnType<typeof createLabels>;

export type FrameState = {
  time: number;
  // Seconds of animation; frozen at 0 with reduced motion.
  clock: number;
  reduced: boolean;
  compact: boolean;
  // Route parameter of every travelling change this frame.
  packets: number[];
};

// A day's representation: it fades in and out over a progress window
// [in start, in end, out start, out end] and animates while visible.
export type Feature = {
  window: [number, number, number, number];
  amount: number;
  update: (state: FrameState) => void;
};

export type Kit = {
  scene: Scene;
  route: Route;
  labels: Labels;
  // Coarse pointers get lighter geometry.
  detail: (fine: number, coarse: number) => number;
};
