// J1 · Cadrage: a survey line sweeps the floor and each component pings as
// it is charted — the map of the real path from code to production.
import { BoxGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry } from "three";
import { followLabel, layout, order, palette, type Feature, type Kit } from "./kit";

const sweepStart = -7.6;
const sweepEnd = 8;
const sweepPeriod = 3.4;

export function createSurvey({ scene, labels, detail }: Kit): Feature {
  const group = new Group();
  scene.add(group);

  const lineMaterial = new MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 0 });
  const line = new Mesh(new BoxGeometry(0.03, 0.02, 7.4), lineMaterial);
  line.position.set(sweepStart, 0.02, 0.35);

  const trailMaterial = new MeshBasicMaterial({
    color: palette.amber,
    transparent: true,
    opacity: 0,
    side: DoubleSide,
    depthWrite: false,
  });
  const trail = new Mesh(new PlaneGeometry(1.4, 7.4), trailMaterial);
  trail.rotation.x = -Math.PI / 2;
  trail.position.y = 0.012;
  group.add(line, trail);

  const pings = order.map((key) => {
    const { x, z, radius } = layout[key];
    const material = new MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 0, side: DoubleSide });
    const ring = new Mesh(new RingGeometry(radius * 1.3, radius * 1.38, detail(64, 40)), material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.01, z);
    group.add(ring);
    return { x, ring, material };
  });

  const tag = labels.add("Cartographie", { tone: "tag", above: true });

  let sweepShown = 0;
  const feature: Feature = {
    window: [0.35, 0.95, 1.35, 1.9],
    amount: 0,
    update({ clock, reduced }) {
      const amount = feature.amount;
      group.visible = amount > 0.005;
      // Reduced motion: the survey is shown complete, every node charted.
      const sweep = reduced ? sweepEnd : sweepStart + ((clock / sweepPeriod) % 1) * (sweepEnd - sweepStart);
      line.position.x = sweep;
      trail.position.x = sweep - 0.7;
      sweepShown = followLabel(tag, sweepShown, reduced);
      lineMaterial.opacity = reduced ? 0 : amount * 0.9 * sweepShown;
      trailMaterial.opacity = reduced ? 0 : amount * 0.06 * sweepShown;

      for (const ping of pings) {
        const behind = sweep - ping.x;
        const strength = reduced ? 0.6 : behind > 0 && behind < 1.8 ? 1 - behind / 1.8 : 0;
        ping.ring.scale.setScalar(1 + (1 - strength) * 0.6);
        ping.material.opacity = strength * amount * 0.8;
      }

      tag.anchor.set(reduced ? 6.6 : sweep, 0.05, -3.1);
      tag.alpha = amount;
    },
  };
  return feature;
}
