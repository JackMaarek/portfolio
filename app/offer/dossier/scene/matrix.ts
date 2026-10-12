// J5 · Restitution: each blind spot leaves the node where it was found and
// settles on an impact × effort grid — how findings are ranked at the
// restitution. The placement is an example, labelled as such: real ranks
// depend on each client's context.
import {
  BoxGeometry,
  ConeGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  Vector3,
} from "three";
import type { NodeKey } from "../dossier-content";
import { followLabel, layout, palette, smoothstep, type Feature, type Kit } from "./kit";

const centre = new Vector3(0.6, 0.03, 4.9);
const width = 4.6;
const depth = 3.2;

// Example placement: effort along x (left = low), impact along -z (back = high).
// Each finding gets its own impact row so the wide labels never share one.
const placement: Partial<Record<NodeKey, { effort: number; impact: number }>> = {
  ci: { effort: 0.84, impact: 0.92 },
  // Low enough that its label clears the quick wins tag in the corner.
  observability: { effort: 0.24, impact: 0.58 },
  registry: { effort: 0.84, impact: 0.54 },
  // Kept off the front edge, where the example caption hangs.
  gitops: { effort: 0.56, impact: 0.24 },
};

const cell = ({ effort, impact }: { effort: number; impact: number }) =>
  new Vector3(centre.x - width / 2 + effort * width, 0.32, centre.z + depth / 2 - impact * depth);

// Grid positions of the findings, for camera fitting.
export const matrixCells = () => Object.values(placement).map((spot) => cell(spot!));

// Outer corners of the grid with its axes, for camera fitting.
export const matrixBounds = {
  left: centre.x - width / 2 - 0.2,
  right: centre.x + width / 2 + 0.2,
  back: centre.z - depth / 2 - 0.3,
  front: centre.z + depth / 2 + 0.3,
};

export function createMatrix(
  { scene, labels }: Kit,
  findings: Partial<Record<NodeKey, string>>,
  quickWins: string,
): Feature {
  const group = new Group();
  scene.add(group);

  const plateMaterial = new MeshStandardMaterial({ color: palette.puck, roughness: 0.9, transparent: true, opacity: 0 });
  const plate = new Mesh(new BoxGeometry(width, 0.04, depth), plateMaterial);
  plate.position.copy(centre);
  const edgeMaterial = new LineBasicMaterial({ color: palette.paper, transparent: true, opacity: 0 });
  const edges = new LineSegments(new EdgesGeometry(plate.geometry), edgeMaterial);
  edges.position.copy(centre);
  group.add(plate, edges);

  const dividerMaterial = new MeshBasicMaterial({ color: palette.idle, transparent: true, opacity: 0 });
  const vertical = new Mesh(new BoxGeometry(0.012, 0.01, depth), dividerMaterial);
  vertical.position.copy(centre).setY(0.06);
  const horizontal = new Mesh(new BoxGeometry(width, 0.01, 0.012), dividerMaterial);
  horizontal.position.copy(centre).setY(0.06);
  group.add(vertical, horizontal);

  // Quick wins: high impact for low effort, the back-left quadrant.
  const quadrantMaterial = new MeshBasicMaterial({
    color: palette.amber,
    transparent: true,
    opacity: 0,
    side: DoubleSide,
    depthWrite: false,
  });
  const quadrant = new Mesh(new PlaneGeometry(width / 2, depth / 2), quadrantMaterial);
  quadrant.rotation.x = -Math.PI / 2;
  quadrant.position.set(centre.x - width / 4, 0.055, centre.z - depth / 4);
  group.add(quadrant);

  // Axes along the left (impact) and front (effort) edges.
  const axisMaterial = new MeshBasicMaterial({ color: palette.paper, transparent: true, opacity: 0 });
  const impactAxis = new Mesh(new BoxGeometry(0.02, 0.02, depth + 0.3), axisMaterial);
  impactAxis.position.set(centre.x - width / 2 - 0.2, 0.06, centre.z);
  const impactHead = new Mesh(new ConeGeometry(0.06, 0.18, 12), axisMaterial);
  impactHead.rotation.x = -Math.PI / 2;
  impactHead.position.set(centre.x - width / 2 - 0.2, 0.06, centre.z - depth / 2 - 0.2);
  const effortAxis = new Mesh(new BoxGeometry(width + 0.3, 0.02, 0.02), axisMaterial);
  effortAxis.position.set(centre.x, 0.06, centre.z + depth / 2 + 0.2);
  const effortHead = new Mesh(new ConeGeometry(0.06, 0.18, 12), axisMaterial);
  effortHead.rotation.z = -Math.PI / 2;
  effortHead.position.set(centre.x + width / 2 + 0.2, 0.06, centre.z + depth / 2 + 0.2);
  group.add(impactAxis, impactHead, effortAxis, effortHead);

  const axisLabels = [
    labels.add("Impact", { tone: "axis", spots: ["below", "left"] }),
    labels.add("Effort", { tone: "axis" }),
    // Outside the grid, level with its quadrant, where no finding lands.
    labels.add(quickWins, { tone: "tag", spots: ["left", "right"] }),
    labels.add("Exemple de classement", { tone: "axis", above: true }),
  ];
  axisLabels[0].anchor.set(centre.x - width / 2 - 0.2, 0.1, centre.z - depth / 2 - 0.45);
  axisLabels[1].anchor.set(centre.x + width / 2 + 0.2, 0.1, centre.z + depth / 2 + 0.35);
  axisLabels[2].anchor.set(centre.x - width / 2 - 0.2, 0.08, centre.z - depth / 4);
  axisLabels[3].anchor.set(centre.x - width / 4 + 0.3, 0.1, centre.z + depth / 2 + 0.75);

  // Findings travel from their node to their place on the grid.
  const pinGeometry = new OctahedronGeometry(0.13);
  const pins = (Object.keys(findings) as NodeKey[])
    .filter((key) => placement[key])
    .map((key) => {
      const material = new MeshBasicMaterial({ color: palette.violet, transparent: true, opacity: 0 });
      const pin = new Mesh(pinGeometry, material);
      group.add(pin);
      const label = labels.add(findings[key] ?? "", { tone: "finding", spots: ["below", "right", "left"] });
      return {
        pin,
        material,
        label,
        from: new Vector3(layout[key].x, 1.05, layout[key].z),
        to: cell(placement[key]!),
      };
    });

  let quadrantShown = 0;
  const feature: Feature = {
    window: [4.4, 4.95, 99, 99],
    amount: 0,
    update({ clock, reduced }) {
      const amount = feature.amount;
      group.visible = amount > 0.005;
      plateMaterial.opacity = amount * 0.92;
      edgeMaterial.opacity = amount * 0.3;
      dividerMaterial.opacity = amount * 0.6;
      quadrantShown = followLabel(axisLabels[2], quadrantShown, reduced);
      quadrantMaterial.opacity = amount * 0.09 * quadrantShown;
      axisMaterial.opacity = amount * 0.55;
      for (const label of axisLabels) label.alpha = smoothstep(0.5, 1, amount);

      // The flight starts once the grid has formed.
      const flight = smoothstep(0.35, 1, amount);
      pins.forEach((entry, index) => {
        const arc = Math.sin(flight * Math.PI) * 1.2;
        entry.pin.position.lerpVectors(entry.from, entry.to, flight);
        entry.pin.position.y += arc + (reduced ? 0 : Math.sin(clock * 1.6 + index) * 0.03);
        entry.pin.rotation.y = reduced ? 0 : clock * 0.6;
        entry.material.opacity = amount;
        entry.label.anchor.copy(entry.pin.position).setY(entry.pin.position.y + 0.15);
        // Fallback above the pin when the spot below is taken.
        entry.label.alt ??= new Vector3();
        entry.label.alt.copy(entry.pin.position).setY(entry.pin.position.y + 0.2);
        entry.label.alpha = smoothstep(0.85, 1, flight);
      });
    },
  };
  return feature;
}
