// HTML labels of the scroll scenes: created once, positioned every frame
// from projected 3D anchors and placed by priority without covering each
// other.
import { Vector3, type PerspectiveCamera } from "three";

export type LabelTone = "node" | "tag" | "finding" | "axis";

// Findings first, then the parts a page opens, which name the page's own
// representation and so outrank even a node in focus (raised by 2), then
// axes and nodes at rest.
const tonePriority: Record<LabelTone, number> = { finding: 4.5, tag: 3.2, axis: 1.5, node: 1 };

// Where a label sits relative to its anchor.
export type LabelSpot = "below" | "above" | "right" | "left";

export type LabelClassNames = Record<LabelTone, string> & { label: string; name: string; meta: string };

export type SceneLabel = {
  element: HTMLDivElement;
  anchor: Vector3;
  // Scene-controlled visibility, multiplied by the in-frame check.
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
  // Last styles written, so unchanged frames touch no DOM.
  opacity: string;
  transform: string;
};

// Nothing is shown unexplained: a secondary element follows its label,
// easing out while the label has no room and back in once it is placed.
export const followLabel = (label: SceneLabel, current: number, reduced: boolean) => {
  const target = label.placed ? 1 : 0;
  return reduced ? target : current + (target - current) * 0.12;
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
      opacity: "",
      transform: "",
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

// Canvas size and the part of it left free by the sheet and the index.
export type LabelView = { width: number; height: number; left: number; right: number; compact: boolean };

// Places every label at its first free spot, by priority; returns whether
// any label appeared or disappeared, so on-demand rendering can settle.
export function createLabelPlacer() {
  const scratch = new Vector3();
  // The spot each label held on the last frame: a label that is showing
  // keeps it while it still fits, so the idle sway never makes it jump.
  const heldSpot = new Map<SceneLabel, string>();

  const spotsFor = (label: SceneLabel, camera: PerspectiveCamera, view: LabelView) => {
    const tryAnchor = (anchor: Vector3, side: LabelSpot) => {
      scratch.copy(anchor).project(camera);
      const x = (scratch.x * 0.5 + 0.5) * view.width;
      const y = (scratch.y * -0.5 + 0.5) * view.height;
      const left =
        side === "right" ? x + 12 : side === "left" ? x - label.width - 12 : x - label.width / 2;
      const top =
        side === "above" ? y - label.height : side === "below" ? y : y - label.height / 2;
      const fits =
        scratch.z < 1 &&
        left > view.left + 4 &&
        left + label.width < view.width - view.right - 4 &&
        top > 4 &&
        top + label.height < view.height - 4;
      return fits ? { left, top, key: anchor === label.alt ? "alt" : side } : null;
    };
    const [first, ...rest] = label.spots;
    return [
      tryAnchor(label.anchor, first),
      label.alt ? tryAnchor(label.alt, "above") : null,
      ...rest.map((side) => tryAnchor(label.anchor, side)),
    ].filter((spot) => spot !== null);
  };

  return (labels: SceneLabel[], camera: PerspectiveCamera, view: LabelView) => {
    let changed = false;
    const placed: { left: number; top: number; right: number; bottom: number }[] = [];
    const ordered = labels
      .map((label) => ({ label, rank: label.priority + label.alpha + (label.element.dataset.focus === "true" ? 2 : 0) }))
      .sort((a, b) => b.rank - a.rank);
    for (const { label } of ordered) {
      const spots = label.alpha > 0.05 && !(view.compact && !label.phone) ? spotsFor(label, camera, view) : [];
      const held = label.placed ? heldSpot.get(label) : undefined;
      spots.sort((a, b) => Number(b.key === held) - Number(a.key === held));
      // A label already showing gets a tighter margin: hysteresis against
      // flicker when a neighbour drifts a pixel closer.
      const margin = label.placed ? 1 : 3;
      let place: (typeof spots)[number] | null = null;
      for (const spot of spots) {
        const rect = { left: spot.left - margin, top: spot.top - margin, right: spot.left + label.width + margin, bottom: spot.top + label.height + margin };
        const collides = placed.some(
          (other) => rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top,
        );
        if (!collides) {
          place = spot;
          placed.push({ left: spot.left - 3, top: spot.top - 3, right: spot.left + label.width + 3, bottom: spot.top + label.height + 3 });
          break;
        }
      }
      changed ||= label.placed !== (place !== null);
      label.placed = place !== null;
      if (place) heldSpot.set(label, place.key);
      // Styles are only written when they change: most labels hold still.
      const opacity = place ? label.alpha.toFixed(2) : "0";
      if (opacity !== label.opacity) {
        label.opacity = opacity;
        label.element.style.opacity = opacity;
      }
      if (place) {
        const transform = `translate(${place.left.toFixed(1)}px, ${place.top.toFixed(1)}px)`;
        if (transform !== label.transform) {
          label.transform = transform;
          label.element.style.transform = transform;
        }
      }
    }
    return changed;
  };
}
