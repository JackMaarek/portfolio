// J3 · Kubernetes & GitOps: the cluster opens into namespaces. A sync wave
// from the GitOps node warms the pods one after the other, while one staging
// pod stays violet: it has drifted from what Git declares.
import {
  BoxGeometry,
  Color,
  EdgesGeometry,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  QuadraticBezierCurve3,
  TubeGeometry,
  Vector3,
} from "three";
import { layout, palette, point, type Feature, type Kit } from "./kit";

const namespaces = ["production", "staging", "plateforme"];
const podsPerNamespace = 6;
const driftedPod = podsPerNamespace + 3;
const spacing = 1.05;
// Scale of the opened cluster; namespace tags follow it.
const openScale = 0.8;

export function createCluster({ scene, labels }: Kit): Feature {
  const { x, z } = layout.cluster;
  const interior = new Group();
  interior.position.set(x, 0.3, z);
  scene.add(interior);

  const plateMaterial = new MeshStandardMaterial({ color: palette.puck, roughness: 0.9, transparent: true, opacity: 0 });
  const plate = new Mesh(new BoxGeometry(3.3, 0.06, 2.3), plateMaterial);
  const edgeMaterial = new LineBasicMaterial({ color: palette.paper, transparent: true, opacity: 0 });
  interior.add(plate, new LineSegments(new EdgesGeometry(plate.geometry), edgeMaterial));

  const trayMaterial = new LineBasicMaterial({ color: palette.violet, transparent: true, opacity: 0 });
  const trayGeometry = new EdgesGeometry(new BoxGeometry(0.92, 0.02, 1.9));
  const tags = namespaces.map((name, index) => {
    const tray = new LineSegments(trayGeometry, trayMaterial);
    tray.position.set((index - 1) * spacing, 0.05, 0);
    interior.add(tray);
    // The middle tag sits on the front edge so neighbours never collide.
    const front = index === 1;
    const tag = labels.add(name, { tone: "tag", above: !front });
    tag.anchor.set(x + (index - 1) * spacing * openScale, 0.62, z + (front ? 0.95 : -0.95) * openScale);
    return tag;
  });

  const podMaterial = new MeshStandardMaterial({ roughness: 0.6, transparent: true, opacity: 0 });
  const pods = new InstancedMesh(new BoxGeometry(0.22, 0.22, 0.22), podMaterial, namespaces.length * podsPerNamespace);
  const podBase: Vector3[] = [];
  namespaces.forEach((_, ns) => {
    for (let pod = 0; pod < podsPerNamespace; pod += 1) {
      podBase.push(new Vector3((ns - 1) * spacing + (pod % 2 === 0 ? -0.2 : 0.2), 0.16, -0.6 + Math.floor(pod / 2) * 0.6));
    }
  });
  interior.add(pods);

  // GitOps sync link into the opened cluster: the source of the pod wave.
  const syncMaterial = new MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 0 });
  const syncLink = new Mesh(
    new TubeGeometry(
      new QuadraticBezierCurve3(
        point("gitops", 0.3),
        new Vector3((layout.gitops.x + x) / 2 - 0.3, 1.4, (layout.gitops.z + z) / 2),
        new Vector3(x - 1.3, 0.62, z),
      ),
      32,
      0.022,
      6,
      false,
    ),
    syncMaterial,
  );
  scene.add(syncLink);

  const dummy = new Object3D();
  const podColor = new Color();

  const feature: Feature = {
    window: [2.35, 2.95, 4.25, 4.85],
    amount: 0,
    update({ time, reduced }) {
      const amount = feature.amount;
      interior.visible = amount > 0.01;
      syncLink.visible = interior.visible;
      interior.position.y = 0.3 + amount * 0.25;
      interior.scale.setScalar(0.3 + amount * (openScale - 0.3));
      plateMaterial.opacity = amount * 0.96;
      edgeMaterial.opacity = amount * 0.3;
      trayMaterial.opacity = amount * 0.55;
      podMaterial.opacity = amount;
      syncMaterial.opacity = amount * 0.9;
      for (const tag of tags) tag.alpha = smoothAlpha(amount);

      const wave = reduced ? -1 : (time / 2400) % 1.6;
      podBase.forEach((base, index) => {
        const phase = index / podBase.length;
        const drifted = index === driftedPod;
        const pulse = wave < 0 || drifted ? 0 : Math.max(0, 1 - Math.abs(wave - phase) * 8);
        dummy.position.copy(base);
        dummy.position.y += pulse * 0.08;
        dummy.updateMatrix();
        pods.setMatrixAt(index, dummy.matrix);
        if (drifted) podColor.copy(palette.violet);
        else podColor.copy(palette.idle).lerp(palette.amber, pulse);
        pods.setColorAt(index, podColor);
      });
      pods.instanceMatrix.needsUpdate = true;
      if (pods.instanceColor) pods.instanceColor.needsUpdate = true;
    },
  };
  return feature;
}

// Tags appear once the cluster is mostly open.
const smoothAlpha = (amount: number) => Math.min(Math.max((amount - 0.6) / 0.4, 0), 1);
