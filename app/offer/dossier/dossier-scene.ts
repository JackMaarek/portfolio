// Three.js scene of the dossier: the delivery chain on the offer's blueprint
// floor. The page scroll sets a continuous progress (0 = cover, 5 = J5);
// each page has a camera framing, a set of audited nodes and its own
// representation of the day (scene/*.ts). Imported lazily so the dossier
// text renders first.
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Fog,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  QuadraticBezierCurve3,
  RingGeometry,
  Scene,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { createFitter, fitBox as box, type FitPoint } from "../../scene/fit";
import { createLabelPlacer, createLabels, followLabel, type LabelClassNames } from "../../scene/labels";
import { createLoop } from "../../scene/loop";
import type { SceneFrame, SceneParts, ScrollScene } from "../../scene/use-scroll-scene";
import type { NodeKey } from "./dossier-content";
import { createCluster } from "./scene/cluster";
import {
  createRoute,
  layout,
  order,
  palette,
  point,
  puckTop,
  smoothstep,
  type Feature,
  type FrameState,
  type Kit,
} from "./scene/kit";
import { createMatrix, matrixBounds, matrixCells } from "./scene/matrix";
import { createPipeline } from "./scene/pipeline";
import { createSignals } from "./scene/signals";
import { createSurvey } from "./scene/survey";

// Camera framing per page: target on the floor and offset from it, given for
// a landscape viewport. Portrait viewports look down the chain instead.
const framings = [
  { target: [1.1, 0, 0.3], offset: [9.4, 8, 16.5] },
  { target: [0.9, 0, 0.3], offset: [-1.6, 25.5, 11] },
  { target: [-2.6, 0, 0.2], offset: [1.2, 6.5, 8.5] },
  { target: [3.1, 0.5, 0], offset: [2.4, 7.5, 9] },
  { target: [5.3, 0.7, 1.3], offset: [-1.4, 4.2, 6.2] },
  { target: [1.5, 0, 2.6], offset: [3.2, 13, 13] },
] as const;

const routePackets = 16;
const signalPackets = 7;

export type ScenePage = { focus: NodeKey[] };

export type SceneOptions = SceneParts & {
  pages: ScenePage[];
  nodes: { key: NodeKey; label: string; examples: string }[];
  findings: Partial<Record<NodeKey, string>>;
  quickWins: string;
  classNames: LabelClassNames;
};

export function createDossierScene(options: SceneOptions): ScrollScene {
  const { canvas, labelLayer, pages, reducedMotion, classNames } = options;
  const loop = createLoop({
    canvas,
    clearColor: palette.ink,
    reducedMotion,
    onContextLost: options.onContextLost,
  });
  const { renderer, detail } = loop;

  const scene = new Scene();
  const fog = new Fog(palette.ink, 24, 56);
  scene.fog = fog;
  const camera = new PerspectiveCamera(35, 1, 0.1, 120);

  scene.add(new AmbientLight(0xffffff, 0.55));
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 12, 7);
  scene.add(key);

  // Blueprint floor: the offer's grid, fading into the fog.
  const gridLines: number[] = [];
  for (let i = -24; i <= 24; i += 1) {
    gridLines.push(i, 0, -24, i, 0, 24, -24, 0, i, 24, 0, i);
  }
  const gridGeometry = new BufferGeometry();
  gridGeometry.setAttribute("position", new Float32BufferAttribute(gridLines, 3));
  scene.add(
    new LineSegments(gridGeometry, new LineBasicMaterial({ color: palette.paper, transparent: true, opacity: 0.07 })),
  );

  // Cloud account boundary drawn on the floor as scenery around the runtime.
  const boundary = new LineSegments(
    new EdgesGeometry(new BoxGeometry(7.8, 0.001, 6)),
    new LineBasicMaterial({ color: palette.violet, transparent: true, opacity: 0.22 }),
  );
  boundary.position.set(3.3, 0.01, 0.6);
  scene.add(boundary);

  // Nodes: matte pucks with a ring and core that warm up when audited.
  const nodeObjects = order.map((nodeKey) => {
    const { x, z, radius } = layout[nodeKey];
    const group = new Group();
    group.position.set(x, 0, z);
    const body = new Mesh(
      new CylinderGeometry(radius, radius * 1.04, 0.26, detail(48, 28)),
      new MeshStandardMaterial({ color: palette.puck, roughness: 0.85, metalness: 0.1 }),
    );
    body.position.y = 0.13;
    const accent = new MeshBasicMaterial({ color: palette.idle.clone() });
    const ring = new Mesh(new RingGeometry(radius * 0.74, radius * 0.86, detail(48, 28)), accent);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = puckTop;
    const core = new Mesh(new CircleGeometry(radius * 0.2, detail(32, 16)), accent);
    core.rotation.x = -Math.PI / 2;
    core.position.y = puckTop + 0.001;
    const footprint = new Mesh(
      new RingGeometry(radius * 1.32, radius * 1.36, detail(64, 32)),
      new MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 0, side: DoubleSide }),
    );
    footprint.rotation.x = -Math.PI / 2;
    footprint.position.y = 0.005;
    group.add(body, ring, core, footprint);
    scene.add(group);
    return { key: nodeKey, body, accent, footprint, level: 0.4 };
  });
  const nodeByKey = Object.fromEntries(nodeObjects.map((node) => [node.key, node])) as Record<
    NodeKey,
    (typeof nodeObjects)[number]
  >;

  // Route: one tube per segment so each day lights its own section.
  const route = createRoute();
  const segments = route.curves.map((curve, index) => {
    const material = new MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 0.2 });
    scene.add(new Mesh(new TubeGeometry(curve, 1, 0.028, 8, false), material));
    return { from: order[index], to: order[index + 1], material, level: 0.2 };
  });

  // Live traffic: changes travelling the chain, signals returning to metrics.
  const packetGeometry = new SphereGeometry(0.06, 12, 8);
  const packets = new InstancedMesh(
    packetGeometry,
    new MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 0.9 }),
    routePackets,
  );
  scene.add(packets);

  const signalCurve = new QuadraticBezierCurve3(
    new Vector3(layout.cluster.x + 1.2, 1, layout.cluster.z + 0.3),
    new Vector3(5.2, 2, 0.9),
    point("observability", 0.3),
  );
  const signalMaterial = new MeshBasicMaterial({ color: palette.violet, transparent: true, opacity: 0.25 });
  const signals = new InstancedMesh(packetGeometry, signalMaterial, signalPackets);
  scene.add(signals);
  const signalTrackMaterial = new MeshBasicMaterial({ color: palette.violet, transparent: true, opacity: 0.12 });
  scene.add(
    new Mesh(
      new TubeGeometry(signalCurve, 32, 0.012, 6, false),
      signalTrackMaterial,
    ),
  );

  // HTML labels, positioned from projected 3D anchors.
  const labels = createLabels(labelLayer, classNames);
  // Code sits at the back of the chain with open floor behind it; its label
  // goes there, leaving the gap in front to CI, which sits just ahead of it.
  const behind = (nodeKey: NodeKey) => nodeKey === "code";
  const nodeLabels = options.nodes.map((node) => {
    const label = labels.add(node.label, { meta: node.examples, above: behind(node.key) });
    const { x, z, radius } = layout[node.key];
    if (behind(node.key)) {
      label.anchor.set(x, 0.4, z - radius - 0.2);
    } else {
      label.anchor.set(x, 0.3, z + radius + 0.35);
      label.alt = new Vector3(x, 0.4, z - radius - 0.2);
    }
    return { key: node.key, label };
  });

  // The violet stream: signals returning from the cluster to observability.
  const signalLabel = labels.add("Signaux", { tone: "tag", above: true });
  // Background scenery outside J4: it gives way to the nodes.
  signalLabel.priority = 2;
  signalLabel.anchor.copy(signalCurve.getPoint(0.5)).setY(signalCurve.getPoint(0.5).y + 0.15);

  // Each day's representation of what is audited.
  const kit: Kit = { scene, route, labels, detail };
  const cluster = createCluster(kit);
  const features: Feature[] = [
    createSurvey(kit),
    createPipeline(kit),
    cluster,
    createSignals(kit),
    createMatrix(kit, options.findings, options.quickWins),
  ];

  // State eased every frame toward the values the progress implies.
  let progress = 0;
  let pageIndex = 0;
  let width = 1;
  let height = 1;
  let compact = false;
  // J5 frames the findings grid alone when the canvas is too small for the
  // whole chain and the grid together: the phone band or a landscape phone.
  let gridOnly = false;
  let free: SceneFrame = { band: false, left: 0, right: 0, top: 0 };
  // Distance scale per page, fitted to the free part of the canvas.
  const fit = framings.map(() => 1);
  const cameraPosition = new Vector3();
  const cameraTarget = new Vector3();
  const desiredPosition = new Vector3();
  const desiredTarget = new Vector3();
  const nextPosition = new Vector3();
  const nextTarget = new Vector3();
  const scratch = new Vector3();
  const matrix = new Matrix4();
  const dummy = new Object3D();
  const packetTs = new Array<number>(routePackets).fill(0);
  let initialised = false;
  let signalShown = 0;

  // Base framing of a page: target and the direction the camera looks from.
  const baseFraming = (index: number, offset: Vector3, target: Vector3) => {
    const framing = framings[index];
    target.set(framing.target[0], framing.target[1], framing.target[2]);
    offset.set(framing.offset[0], framing.offset[1], framing.offset[2]);
    if (gridOnly && index === 5) {
      // Seen from higher up, impact spreads vertically and the wide finding
      // labels stack instead of colliding side by side.
      target.set(0.6, 0, 4.8);
      offset.set(0.2, 9, 3.4);
    }
  };

  const framingAt = (index: number, position: Vector3, target: Vector3) => {
    baseFraming(index, position, target);
    position.multiplyScalar(fit[index]).add(target);
  };

  // What each page must show, with the room its label needs in pixels.
  const nodePoints = (keys: NodeKey[]): FitPoint[] =>
    keys.flatMap((nodeKey) => {
      const label = nodeLabels.find((entry) => entry.key === nodeKey)!.label;
      const room = label.height + 6;
      return [
        { at: new Vector3(layout[nodeKey].x, puckTop, layout[nodeKey].z), padX: 36, padTop: 24, padBottom: 12 },
        behind(nodeKey)
          ? { at: label.anchor, padX: label.width / 2 + 6, padTop: room, padBottom: 0 }
          : { at: label.anchor, padX: label.width / 2 + 6, padTop: 0, padBottom: room },
      ];
    });
  const { cluster: c, observability: o, registry: r } = layout;
  const mustSee = (index: number): FitPoint[] => {
    switch (index) {
      case 2:
        return [...nodePoints(["code", "ci", "registry"]), box(r.x + 0.9, 1.1, r.z, 50, 30)];
      case 3:
        return [
          ...nodePoints(["gitops"]),
          box(c.x - 1.35, 0.6, c.z - 0.95, 12, 34),
          box(c.x + 1.35, 0.6, c.z - 0.95, 40, 34),
          box(c.x - 1.35, 0.55, c.z + 0.95),
          box(c.x + 1.35, 0.55, c.z + 0.95),
          // The staging tag hangs below the front edge.
          box(c.x, 0.62, c.z + 0.76, 40, 0, 30),
        ];
      case 4:
        return [
          ...nodePoints(["observability"]),
          box(o.x - 0.7, puckTop + 1.1, o.z, 60, 30),
          box(o.x + 0.7, puckTop + 1.1, o.z, 24, 20),
          box(c.x + 0.6, 0.7, c.z),
        ];
      case 5:
        return [
          ...(gridOnly ? [] : nodePoints(order)),
          // Finding labels hang below their pin on the grid.
          ...matrixCells().map((at) => box(at.x, at.y + 0.15, at.z, 72, 12, 30)),
          box(matrixBounds.left, 0.1, matrixBounds.back, 30, 30),
          box(matrixBounds.right, 0.1, matrixBounds.back, 30, 20),
          box(matrixBounds.left, 0.1, matrixBounds.front, 40, 12, 30),
          box(matrixBounds.right, 0.1, matrixBounds.front, 30, 12, 30),
        ];
      default:
        return nodePoints(order);
    }
  };

  // Closest camera distance at which every must-see point and its label
  // fit inside the free part of the frame; recomputed on every resize.
  const closestScale = createFitter(camera);
  const fitOffset = new Vector3();
  const fitTarget = new Vector3();
  // Optical centre: the middle of the free part of the frame. On the cover
  // it also sits below the top bar; that shift eases out with the scroll.
  let appliedShift = Number.NaN;
  const centreOptics = (coverShare: number) => {
    const shiftX = width / 2 - (free.left + width - free.right) / 2;
    const shiftY = -(free.top / 2) * coverShare;
    if (shiftY === appliedShift && !Number.isNaN(appliedShift)) return;
    appliedShift = shiftY;
    camera.setViewOffset(width, height, shiftX, shiftY, width, height);
    camera.updateProjectionMatrix();
  };

  const fitFramings = () => {
    framings.forEach((_, index) => {
      appliedShift = Number.NaN;
      centreOptics(index === 0 ? 1 : 0);
      baseFraming(index, fitOffset, fitTarget);
      // Only the cover shares the first viewport with the top bar.
      const bounds = {
        width,
        height,
        left: free.left + 8,
        right: width - free.right - 8,
        top: index === 0 ? free.top : 8,
        bottom: height - 8,
      };
      const all = mustSee(index);
      const closest = (points: FitPoint[]) => closestScale(points, fitOffset, fitTarget, bounds);
      // Objects always fit; labels only earn extra distance while it stays
      // modest; past that a few labels give way rather than the scene shrink.
      const core = closest(all.map((point) => ({ ...point, padX: Math.min(point.padX, 28), padBottom: 10 })));
      const full = closest(all);
      // A little air so the idle sway never pushes anything out.
      fit[index] = Math.min(full, core * 1.3) * 1.04;
    });
    appliedShift = Number.NaN;
    initialised = false;
  };

  const computeDesired = () => {
    const index = Math.min(Math.floor(progress), framings.length - 1);
    const next = Math.min(index + 1, framings.length - 1);
    const t = MathUtils.smootherstep(progress - index, 0.15, 0.85);
    framingAt(index, desiredPosition, desiredTarget);
    framingAt(next, nextPosition, nextTarget);
    desiredPosition.lerp(nextPosition, t);
    desiredTarget.lerp(nextTarget, t);
  };

  const resize = () => {
    width = canvas.clientWidth || 1;
    height = canvas.clientHeight || 1;
    compact = free.band;
    gridOnly = compact || height < 560;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    labels.measure();
    fitFramings();
    loop.invalidate();
  };

  const allLitPage = () => pageIndex === 0 || pageIndex === pages.length - 1;

  const placeLabels = createLabelPlacer();

  const updateLabels = () => {
    const focusCount = pages[pageIndex]?.focus.length ?? 0;
    const narrow = focusCount > 0 && focusCount <= 3;
    for (const { key: nodeKey, label } of nodeLabels) {
      const level = nodeByKey[nodeKey].level;
      const hidden = nodeKey === "cluster" ? smoothstep(0, 0.4, cluster.amount) : 0;
      label.alpha = (0.35 + level * 0.65) * (1 - hidden);
      label.element.dataset.focus = level > 0.7 ? "true" : "false";
      // On phones only the nodes of a narrow focus keep their second line.
      const detail = String(!compact || (level > 0.7 && narrow));
      if (label.element.dataset.detail !== detail) {
        label.element.dataset.detail = detail;
        label.width = label.element.offsetWidth;
        label.height = label.element.offsetHeight;
      }
    }
    // Place labels by priority; one that would cover a placed label waits.
    return placeLabels(labels.labels, camera, { width, height, left: free.left, right: free.right, compact });
  };

  const featureRested = features.map(() => false);
  const state: FrameState = { time: 0, clock: 0, reduced: reducedMotion, compact: false, packets: packetTs };

  loop.start((time, delta) => {
    // Exponential damping; reduced motion snaps straight to the target.
    const ease = (rate: number) => (reducedMotion || !initialised ? 1 : 1 - Math.exp(-rate * delta));

    centreOptics(1 - smoothstep(0, 0.6, progress));
    computeDesired();
    cameraPosition.lerp(desiredPosition, ease(3.2));
    cameraTarget.lerp(desiredTarget, ease(3.2));
    camera.position.copy(cameraPosition);
    if (!reducedMotion) {
      camera.position.x += Math.sin(time / 5200) * 0.18;
      camera.position.y += Math.sin(time / 6100) * 0.1;
    }
    camera.lookAt(cameraTarget);
    // Fog follows the camera distance, so a fitted wide shot never fades out.
    const distance = camera.position.distanceTo(cameraTarget);
    fog.near = distance + 4;
    fog.far = distance + 34;
    initialised = true;
    // Once the camera has settled only the idle motion is left (packets,
    // sweep, sway): the loop renders it at half rate.
    const settled =
      cameraPosition.distanceToSquared(desiredPosition) < 1e-4 &&
      cameraTarget.distanceToSquared(desiredTarget) < 1e-4;

    const page = pages[pageIndex];
    for (const node of nodeObjects) {
      const focused = page?.focus.includes(node.key);
      const target = focused ? 1 : pageIndex === 0 ? 0.85 : allLitPage() ? 0.7 : 0.18;
      node.level += (target - node.level) * ease(4);
      node.accent.color.copy(palette.idle).lerp(palette.amber, smoothstep(0.3, 1, node.level));
      (node.footprint.material as MeshBasicMaterial).opacity = smoothstep(0.7, 1, node.level) * 0.5;
    }
    nodeByKey.cluster.body.scale.set(1, 1 - cluster.amount * 0.5, 1);

    for (const segment of segments) {
      const lit = Math.min(nodeByKey[segment.from].level, nodeByKey[segment.to].level);
      segment.level += (lit - segment.level) * ease(4);
      segment.material.opacity = 0.12 + segment.level * 0.8;
    }

    const clock = reducedMotion ? 0 : time / 1000;
    for (let index = 0; index < routePackets; index += 1) {
      const t = (index / routePackets + clock * 0.035) % 1;
      packetTs[index] = t;
      route.at(t, scratch);
      dummy.position.copy(scratch);
      dummy.position.y += 0.06;
      dummy.scale.setScalar(0.8 + 0.4 * Math.sin(t * Math.PI));
      dummy.updateMatrix();
      packets.setMatrixAt(index, dummy.matrix);
    }
    packets.instanceMatrix.needsUpdate = true;

    for (let index = 0; index < signalPackets; index += 1) {
      const t = (index / signalPackets + clock * 0.08) % 1;
      signalCurve.getPointAt(t, scratch);
      matrix.makeTranslation(scratch.x, scratch.y, scratch.z);
      signals.setMatrixAt(index, matrix);
    }
    signals.instanceMatrix.needsUpdate = true;
    signalShown = followLabel(signalLabel, signalShown, reducedMotion);
    signalMaterial.opacity = (0.2 + nodeByKey.observability.level * 0.75) * signalShown;
    signalTrackMaterial.opacity = 0.12 * signalShown;
    // Named whenever the stream is in view, except over the open cluster.
    signalLabel.alpha = (0.4 + nodeByKey.observability.level * 0.6) * (1 - cluster.amount * (pageIndex === 3 ? 1 : 0));

    state.time = time;
    state.clock = clock;
    state.compact = compact;
    features.forEach((feature, index) => {
      const [inStart, inEnd, outStart, outEnd] = feature.window;
      const target = smoothstep(inStart, inEnd, progress) * (1 - smoothstep(outStart, outEnd, progress));
      feature.amount += (target - feature.amount) * ease(3);
      if (feature.amount < 0.001) feature.amount = 0;
      // A hidden day is updated once more to hide its group and labels,
      // then skipped until the progress brings it back.
      const rested = feature.amount === 0 && target === 0;
      if (rested && featureRested[index]) return;
      featureRested[index] = rested;
      feature.update(state);
    });

    renderer.render(scene, camera);
    return { settled, placementChanged: updateLabels() };
  });

  resize();

  return {
    setProgress(value) {
      progress = MathUtils.clamp(value, 0, pages.length - 1);
      pageIndex = Math.round(progress);
      loop.invalidate();
    },
    setFrame(next) {
      free = next;
      resize();
    },
    // Rendering stops entirely while the scene is scrolled out of view.
    setActive: loop.setActive,
    dispose() {
      loop.dispose(scene);
      labelLayer.replaceChildren();
    },
  };
}
