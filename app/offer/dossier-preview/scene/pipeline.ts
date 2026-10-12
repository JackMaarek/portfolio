// J2 · CI/CD: the CI → Registry link opens into its stages. Changes light
// each stage as they pass, the tests stage flickers like a flaky suite, a
// gate opens before publication and the registry keeps the previous versions
// a rollback can return to.
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  QuadraticBezierCurve3,
  TubeGeometry,
  Vector3,
} from "three";
import { layout, palette, type Feature, type Kit } from "./kit";

const stageNames = ["Build", "Tests", "Scan", "Publication"];
const stageAt = [0.18, 0.38, 0.58, 0.78];
const gateAt = 0.92;
// CI → Registry is the second segment of the route.
const segment = 1;

export function createPipeline({ scene, route, labels, detail }: Kit): Feature {
  const group = new Group();
  scene.add(group);

  const curve = route.curves[segment];
  const direction = curve.v2.clone().sub(curve.v1).normalize();
  const angle = -Math.atan2(direction.z, direction.x);
  const across = new Vector3(-direction.z, 0, direction.x);

  const bodyMaterial = new MeshStandardMaterial({ color: palette.puck, roughness: 0.85, transparent: true, opacity: 0 });
  const stages = stageNames.map((name, index) => {
    const position = curve.getPointAt(stageAt[index]);
    const body = new Mesh(new BoxGeometry(0.36, 0.2, 0.28), bodyMaterial);
    body.position.set(position.x, 0.12, position.z);
    body.rotation.y = angle;
    const topMaterial = new MeshBasicMaterial({ color: palette.idle.clone(), transparent: true, opacity: 0 });
    const top = new Mesh(new BoxGeometry(0.3, 0.012, 0.22), topMaterial);
    top.position.set(position.x, 0.226, position.z);
    top.rotation.y = angle;
    group.add(body, top);
    const label = labels.add(name, { tone: "tag", above: true, phone: false });
    label.anchor.set(position.x, 0.5, position.z);
    return { t: route.tOf(segment, stageAt[index]), topMaterial, label, flaky: name === "Tests" };
  });

  // Gate: two posts and a bar that lifts when a change has passed the stages.
  const gatePosition = curve.getPointAt(gateAt);
  const gateMaterial = new MeshBasicMaterial({ color: palette.idle.clone(), transparent: true, opacity: 0 });
  for (const side of [-1, 1]) {
    const post = new Mesh(new BoxGeometry(0.04, 0.42, 0.04), gateMaterial);
    post.position.copy(gatePosition).addScaledVector(across, side * 0.26).setY(0.21);
    group.add(post);
  }
  const bar = new Mesh(new BoxGeometry(0.04, 0.04, 0.56), gateMaterial);
  bar.position.copy(gatePosition).setY(0.24);
  bar.rotation.y = angle;
  group.add(bar);
  const gateT = route.tOf(segment, gateAt);

  // Registry version stack: the current release on top, previous ones below.
  const { x, z } = layout.registry;
  const versionMaterials = [0, 1, 2].map(
    (index) =>
      new MeshBasicMaterial({ color: index === 0 ? palette.amber : palette.idle, transparent: true, opacity: 0 }),
  );
  versionMaterials.forEach((material, index) => {
    const disc = new Mesh(new CylinderGeometry(0.22, 0.22, 0.035, detail(40, 24)), material);
    disc.position.set(x, 0.86 - index * 0.17, z);
    group.add(disc);
  });
  const rollbackMaterial = new MeshBasicMaterial({ color: palette.violet, transparent: true, opacity: 0 });
  const rollback = new Mesh(
    new TubeGeometry(
      new QuadraticBezierCurve3(
        new Vector3(x + 0.22, 0.86, z),
        new Vector3(x + 0.8, 0.78, z),
        new Vector3(x + 0.22, 0.69, z),
      ),
      16,
      0.016,
      6,
      false,
    ),
    rollbackMaterial,
  );
  group.add(rollback);
  const rollbackLabel = labels.add("Rollback", { tone: "tag", above: true });
  rollbackLabel.anchor.set(x + 0.9, 1, z);

  const feature: Feature = {
    window: [1.35, 1.95, 2.35, 2.9],
    amount: 0,
    update({ clock, reduced, packets }) {
      const amount = feature.amount;
      group.visible = amount > 0.005;
      bodyMaterial.opacity = amount;

      // A stage lights while a change crosses it.
      const near = (t: number) => {
        let best = 0;
        for (const packet of packets) {
          const distance = Math.abs(packet - t) * route.total;
          if (distance < 0.3) best = Math.max(best, 1 - distance / 0.3);
        }
        return reduced ? 0.6 : best;
      };

      // The tests stage fails briefly every few seconds: a flaky suite.
      const flicker = !reduced && clock % 3.6 < 0.4 && Math.sin(clock * 40) > 0;
      for (const stage of stages) {
        stage.topMaterial.opacity = amount;
        if (stage.flaky && flicker) stage.topMaterial.color.copy(palette.violet);
        else stage.topMaterial.color.copy(palette.idle).lerp(palette.amber, near(stage.t));
        stage.label.alpha = amount;
      }

      const open = near(gateT);
      gateMaterial.opacity = amount;
      gateMaterial.color.copy(palette.idle).lerp(palette.amber, open);
      bar.position.y = 0.24 + open * 0.22;

      versionMaterials.forEach((material, index) => {
        material.opacity = amount * (index === 0 ? 1 : 0.8);
      });
      rollbackMaterial.opacity = amount * (reduced ? 0.8 : 0.45 + 0.4 * Math.sin(clock * 2.2));
      rollbackLabel.alpha = amount;
    },
  };
  return feature;
}
