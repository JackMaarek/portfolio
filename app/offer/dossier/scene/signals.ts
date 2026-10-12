// J4 · Observabilité: the four golden signals rise as live bars on the
// observability node. Errors spike past the alert threshold now and then —
// the one alert worth waking someone for.
import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from "three";
import { followLabel, layout, palette, puckTop, type Feature, type Kit } from "./kit";

const threshold = 0.82;

// Synthetic, unitless levels: they show the reading, not a measurement.
const signals = [
  { name: "Latence", level: (t: number) => 0.46 + 0.14 * Math.sin(t * 1.3) },
  { name: "Trafic", level: (t: number) => 0.6 + 0.22 * Math.sin(t * 0.9 + 1) },
  {
    name: "Erreurs",
    level: (t: number) => {
      const phase = t % 5.2;
      return phase < 1.3 ? 0.28 + 0.78 * Math.sin((phase / 1.3) * Math.PI) : 0.22 + 0.05 * Math.sin(t * 3);
    },
  },
  { name: "Saturation", level: (t: number) => 0.5 + 0.1 * Math.sin(t * 0.7 + 2) },
];

export function createSignals({ scene, labels }: Kit): Feature {
  const { x, z } = layout.observability;
  const group = new Group();
  group.position.set(x, puckTop, z);
  scene.add(group);

  const bars = signals.map((signal, index) => {
    const material = new MeshBasicMaterial({ color: palette.idle.clone(), transparent: true, opacity: 0 });
    const bar = new Mesh(new BoxGeometry(0.16, 1, 0.16), material);
    bar.position.x = (index - 1.5) * 0.4;
    group.add(bar);
    const label = labels.add(signal.name, { tone: "tag", phone: false });
    return { ...signal, bar, material, label };
  });

  const thresholdMaterial = new MeshBasicMaterial({ color: palette.violet.clone(), transparent: true, opacity: 0 });
  const thresholdLine = new Mesh(new BoxGeometry(1.5, 0.014, 0.02), thresholdMaterial);
  thresholdLine.position.set(0, threshold, 0.1);
  group.add(thresholdLine);
  const thresholdLabel = labels.add("Seuil d’alerte", { tone: "tag", above: true });
  thresholdLabel.anchor.set(x - 1.05, puckTop + threshold + 0.1, z + 0.1);

  let thresholdShown = 0;
  const feature: Feature = {
    window: [3.4, 3.95, 4.4, 4.9],
    amount: 0,
    update({ clock, reduced }) {
      const amount = feature.amount;
      group.visible = amount > 0.005;
      let alerting = false;
      for (const signal of bars) {
        // Reduced motion: a still reading with the error alert raised.
        const level = reduced ? (signal.name === "Erreurs" ? 0.95 : signal.level(0)) : signal.level(clock);
        const height = Math.max(level * amount, 0.001);
        signal.bar.scale.y = height;
        signal.bar.position.y = height / 2;
        const firing = signal.name === "Erreurs" && level > threshold;
        alerting ||= firing;
        signal.material.color.copy(firing ? palette.amber : palette.idle);
        signal.material.opacity = amount;
        // Names sit at the foot of each bar, on the front edge of the puck.
        signal.label.anchor.set(x + signal.bar.position.x, puckTop, z + 0.22);
        signal.label.alpha = amount;
      }
      thresholdMaterial.color.copy(alerting ? palette.amber : palette.violet);
      thresholdShown = followLabel(thresholdLabel, thresholdShown, reduced);
      thresholdMaterial.opacity = amount * 0.9 * thresholdShown;
      thresholdLabel.alpha = amount;
    },
  };
  return feature;
}
