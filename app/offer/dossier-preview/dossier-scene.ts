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
  type Material,
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
  WebGLRenderer,
} from "three";
import type { NodeKey } from "./dossier-content";
import { createCluster } from "./scene/cluster";
import {
  createLabels,
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
  type LabelClassNames,
} from "./scene/kit";
import { createMatrix } from "./scene/matrix";
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
const widePages = new Set([0, 1, 5]);

const routePackets = 16;
const signalPackets = 7;

export type ScenePage = { focus: NodeKey[] };

export type SceneOptions = {
  canvas: HTMLCanvasElement;
  labelLayer: HTMLElement;
  pages: ScenePage[];
  nodes: { key: NodeKey; label: string; examples: string }[];
  findings: Partial<Record<NodeKey, string>>;
  quickWins: string;
  reducedMotion: boolean;
  classNames: LabelClassNames;
  onContextLost: () => void;
};

export type DossierScene = {
  setProgress: (progress: number) => void;
  setActive: (active: boolean) => void;
  resize: () => void;
  dispose: () => void;
};

export function createDossierScene(options: SceneOptions): DossierScene {
  const { canvas, labelLayer, pages, reducedMotion, classNames } = options;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const detail = (fine: number, rough: number) => (coarse ? rough : fine);

  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  // Pixel ratio starts capped and only ever steps down if frames run long.
  let pixelRatio = Math.min(window.devicePixelRatio, coarse ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(palette.ink);

  const scene = new Scene();
  scene.fog = new Fog(palette.ink, 24, 56);
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
  scene.add(
    new Mesh(
      new TubeGeometry(signalCurve, 32, 0.012, 6, false),
      new MeshBasicMaterial({ color: palette.violet, transparent: true, opacity: 0.12 }),
    ),
  );

  // HTML labels, positioned from projected 3D anchors.
  const labels = createLabels(labelLayer, classNames);
  const nodeLabels = options.nodes.map((node) => {
    const label = labels.add(node.label, { meta: node.examples });
    const { x, z, radius } = layout[node.key];
    label.anchor.set(x, 0.3, z + radius + 0.35);
    return { key: node.key, label };
  });

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
  let portrait = false;
  let compact = false;
  let freeLeft = 8;
  let freeRight = 8;
  let active = true;
  const cameraPosition = new Vector3();
  const cameraTarget = new Vector3();
  const desiredPosition = new Vector3();
  const desiredTarget = new Vector3();
  const nextPosition = new Vector3();
  const nextTarget = new Vector3();
  const scratch = new Vector3();
  const yAxis = new Vector3(0, 1, 0);
  const matrix = new Matrix4();
  const dummy = new Object3D();
  const packetTs = new Array<number>(routePackets).fill(0);
  let initialised = false;
  let dirty = true;

  const framingAt = (index: number, position: Vector3, target: Vector3) => {
    const framing = framings[index];
    target.set(framing.target[0], framing.target[1], framing.target[2]);
    position.set(framing.offset[0], framing.offset[1], framing.offset[2]);
    if (portrait) {
      // Look down the chain so it recedes into depth instead of overflowing.
      position.applyAxisAngle(yAxis, -Math.PI / 2.6);
      position.multiplyScalar(widePages.has(index) ? 1.08 : 1.15);
    }
    if (compact) {
      // Phone band: the whole width is free, so the camera comes closer;
      // on J5 it frames the findings grid rather than the whole chain.
      if (index === 5) {
        target.set(0.6, 0, 4.4);
        position.set(0.4, 7, 6.2);
      } else {
        position.multiplyScalar(widePages.has(index) ? 0.66 : index === 3 ? 0.46 : 0.72);
      }
      if (index === 0 || index === 1) target.x += 0.45;
    }
    position.add(target);
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
    portrait = width / height < 0.9;
    compact = width < 900 && !portrait;
    // Wide screens: the sheet covers the left (gutter + min(33rem, 40vw))
    // and the index the right edge; labels only show in between.
    freeLeft = width >= 900 ? Math.min(width * 0.4, 528) + 42 : 8;
    freeRight = width >= 900 ? 150 : 8;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Shift the optical centre into the free band between sheet and index.
    if (portrait) camera.setViewOffset(width, height, 0, height * 0.2, width, height);
    else if (width >= 900) camera.setViewOffset(width, height, -width * 0.15, 0, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    labels.measure();
    dirty = true;
  };

  const allLitPage = () => pageIndex === 0 || pageIndex === pages.length - 1;

  const updateLabels = () => {
    for (const { key: nodeKey, label } of nodeLabels) {
      const level = nodeByKey[nodeKey].level;
      const hidden = nodeKey === "cluster" ? smoothstep(0, 0.4, cluster.amount) : 0;
      label.alpha = (0.35 + level * 0.65) * (1 - hidden);
      label.element.dataset.focus = level > 0.7 ? "true" : "false";
      // On phones only the nodes of a narrow focus keep their second line.
      const focusCount = pages[pageIndex]?.focus.length ?? 0;
      const narrow = focusCount > 0 && focusCount <= 3;
      label.element.dataset.detail = String(!compact || (level > 0.7 && narrow));
    }
    for (const label of labels.labels) {
      if (label.alpha <= 0.01 || (compact && !label.phone)) {
        label.element.style.opacity = "0";
        continue;
      }
      scratch.copy(label.anchor).project(camera);
      const x = (scratch.x * 0.5 + 0.5) * width;
      const y = (scratch.y * -0.5 + 0.5) * height;
      const top = label.above ? y - label.height : y;
      // A label only shows while its anchor is in the free part of the frame:
      // not cut by an edge, not under the dossier sheet or the page index.
      const visible =
        scratch.z < 1 &&
        x - label.width / 2 > freeLeft &&
        x + label.width / 2 < width - freeRight &&
        top > 0 &&
        top + label.height < height;
      label.element.style.opacity = visible ? label.alpha.toFixed(3) : "0";
      if (visible) {
        label.element.style.transform = `translate(${(x - label.width / 2).toFixed(1)}px, ${top.toFixed(1)}px)`;
      }
    }
  };

  // Frame budget watch: if frames keep running long, lower the pixel ratio.
  let slowFrames = 0;
  let sampledFrames = 0;
  const watchFrameTime = (delta: number) => {
    if (reducedMotion || pixelRatio <= 1) return;
    sampledFrames += 1;
    if (delta > 1 / 40) slowFrames += 1;
    if (sampledFrames < 90) return;
    if (slowFrames > 45) {
      pixelRatio = Math.max(1, pixelRatio - 0.25);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
    }
    slowFrames = 0;
    sampledFrames = 0;
  };

  const state: FrameState = { time: 0, clock: 0, reduced: reducedMotion, compact: false, packets: packetTs };

  let lastTime = performance.now();
  const frame = (time: number) => {
    if (reducedMotion && !dirty) return;
    const delta = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;
    if (initialised) watchFrameTime(delta);
    // Exponential damping; reduced motion snaps straight to the target.
    const ease = (rate: number) => (reducedMotion || !initialised ? 1 : 1 - Math.exp(-rate * delta));

    computeDesired();
    cameraPosition.lerp(desiredPosition, ease(3.2));
    cameraTarget.lerp(desiredTarget, ease(3.2));
    camera.position.copy(cameraPosition);
    if (!reducedMotion) {
      camera.position.x += Math.sin(time / 5200) * 0.18;
      camera.position.y += Math.sin(time / 6100) * 0.1;
    }
    camera.lookAt(cameraTarget);
    initialised = true;

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
    signalMaterial.opacity = 0.2 + nodeByKey.observability.level * 0.75;

    state.time = time;
    state.clock = clock;
    state.compact = compact;
    for (const feature of features) {
      const [inStart, inEnd, outStart, outEnd] = feature.window;
      const target = smoothstep(inStart, inEnd, progress) * (1 - smoothstep(outStart, outEnd, progress));
      feature.amount += (target - feature.amount) * ease(3);
      if (feature.amount < 0.001) feature.amount = 0;
      feature.update(state);
    }

    renderer.render(scene, camera);
    updateLabels();
    dirty = false;
  };

  // A lost GPU context (memory pressure on phones): stop and let the page
  // fall back to the text-only dossier.
  const onContextLost = (event: Event) => {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    options.onContextLost();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  resize();
  renderer.setAnimationLoop(frame);

  return {
    setProgress(value) {
      progress = MathUtils.clamp(value, 0, pages.length - 1);
      pageIndex = Math.round(progress);
      dirty = true;
    },
    // Rendering stops entirely while the scene is scrolled out of view.
    setActive(value) {
      if (value === active) return;
      active = value;
      lastTime = performance.now();
      dirty = true;
      renderer.setAnimationLoop(active ? frame : null);
    },
    resize,
    dispose() {
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof LineSegments || object instanceof InstancedMesh) {
          object.geometry.dispose();
          const materials: Material[] = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      labelLayer.replaceChildren();
    },
  };
}
