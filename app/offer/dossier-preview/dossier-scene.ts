// Three.js scene of the dossier: the delivery chain on the offer's blueprint
// floor. The page scroll sets a continuous progress (0 = cover, 5 = J5);
// each page has a camera framing and a set of focused nodes, and the scene
// eases between them. Imported lazily so the dossier text renders first.
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Fog,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineCurve3,
  LineSegments,
  type Material,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  OctahedronGeometry,
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

const palette = {
  ink: new Color("#0b0b0d"),
  puck: new Color("#18171d"),
  idle: new Color("#5d5a68"),
  paper: new Color("#efedf5"),
  amber: new Color("#ffbd74"),
  violet: new Color("#aba2ff"),
};

// Chain layout on the floor (x, z), left to right in delivery order.
const layout: Record<NodeKey, { x: number; z: number; radius: number }> = {
  code: { x: -5.6, z: -1, radius: 0.5 },
  ci: { x: -3.5, z: 1.2, radius: 0.5 },
  registry: { x: -1.3, z: -0.5, radius: 0.5 },
  gitops: { x: 0.9, z: 1.4, radius: 0.55 },
  cluster: { x: 3.4, z: -0.2, radius: 0.85 },
  observability: { x: 5.7, z: 1.7, radius: 0.55 },
};
const order: NodeKey[] = ["code", "ci", "registry", "gitops", "cluster", "observability"];

// Camera framing per page: target on the floor and offset from it, given for
// a landscape viewport. Portrait viewports look down the chain instead.
const framings = [
  { target: [1.1, 0, 0.3], offset: [9.4, 8, 16.5] },
  { target: [0, 0, 0.2], offset: [-1.5, 24, 10] },
  { target: [-3.4, 0, 0], offset: [1.4, 8.5, 11] },
  { target: [3.1, 0.5, 0], offset: [2.4, 7.5, 9] },
  { target: [4.6, 0.3, 0.8], offset: [-1.2, 7, 9.5] },
  { target: [0.4, 0, 0.3], offset: [5, 10, 16] },
] as const;

const namespaces = ["production", "staging", "plateforme"];
const podsPerNamespace = 6;
const driftedPod = podsPerNamespace + 3;
const routePackets = 16;
const signalPackets = 7;

export type ScenePage = { focus: NodeKey[]; findings: Partial<Record<NodeKey, string>> };

export type SceneOptions = {
  canvas: HTMLCanvasElement;
  labelLayer: HTMLElement;
  pages: ScenePage[];
  nodes: { key: NodeKey; label: string; examples: string }[];
  reducedMotion: boolean;
  classNames: { label: string; name: string; meta: string; namespace: string };
};

export type DossierScene = {
  setProgress: (progress: number) => void;
  resize: () => void;
  dispose: () => void;
};

const smoothstep = (edge0: number, edge1: number, value: number) =>
  MathUtils.smoothstep(value, edge0, edge1);

export function createDossierScene(options: SceneOptions): DossierScene {
  const { canvas, labelLayer, pages, reducedMotion, classNames } = options;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
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
  const grid = new LineSegments(
    gridGeometry,
    new LineBasicMaterial({ color: palette.paper, transparent: true, opacity: 0.07 }),
  );
  scene.add(grid);

  // Cloud account boundary drawn on the floor as scenery around the runtime.
  const boundary = new LineSegments(
    new EdgesGeometry(new BoxGeometry(7.8, 0.001, 6)),
    new LineBasicMaterial({ color: palette.violet, transparent: true, opacity: 0.22 }),
  );
  boundary.position.set(3.3, 0.01, 0.6);
  scene.add(boundary);

  // Nodes: matte pucks with a ring and core that warm up when audited.
  const nodeObjects = order.map((key) => {
    const { x, z, radius } = layout[key];
    const group = new Group();
    group.position.set(x, 0, z);
    const body = new Mesh(
      new CylinderGeometry(radius, radius * 1.04, 0.26, 48),
      new MeshStandardMaterial({ color: palette.puck, roughness: 0.85, metalness: 0.1 }),
    );
    body.position.y = 0.13;
    const accent = new MeshBasicMaterial({ color: palette.idle.clone() });
    const ring = new Mesh(new RingGeometry(radius * 0.74, radius * 0.86, 48), accent);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.262;
    const core = new Mesh(new CircleGeometry(radius * 0.2, 32), accent);
    core.rotation.x = -Math.PI / 2;
    core.position.y = 0.263;
    const footprint = new Mesh(
      new RingGeometry(radius * 1.32, radius * 1.36, 64),
      new MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 0, side: DoubleSide }),
    );
    footprint.rotation.x = -Math.PI / 2;
    footprint.position.y = 0.005;
    const pin = new Mesh(
      new OctahedronGeometry(0.13),
      new MeshBasicMaterial({ color: palette.violet, transparent: true, opacity: 0 }),
    );
    pin.position.y = 1.15;
    group.add(body, ring, core, footprint, pin);
    scene.add(group);
    return { key, group, body, accent, footprint, pin, level: 0.4 };
  });
  const nodeByKey = Object.fromEntries(nodeObjects.map((node) => [node.key, node])) as Record<
    NodeKey,
    (typeof nodeObjects)[number]
  >;

  // Route: one tube per segment so each day lights its own section.
  const point = (key: NodeKey, y = 0.14) => new Vector3(layout[key].x, y, layout[key].z);
  const segments = order.slice(1).map((key, index) => {
    const from = order[index];
    const curve = new LineCurve3(point(from), point(key));
    const material = new MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 0.2 });
    const mesh = new Mesh(new TubeGeometry(curve, 1, 0.028, 8, false), material);
    scene.add(mesh);
    return { from, to: key, curve, material, level: 0.2 };
  });
  const routeLengths = segments.map((segment) => segment.curve.getLength());
  const routeLength = routeLengths.reduce((sum, length) => sum + length, 0);

  const routeAt = (t: number, target: Vector3) => {
    let distance = t * routeLength;
    for (let index = 0; index < segments.length; index += 1) {
      if (distance <= routeLengths[index] || index === segments.length - 1) {
        return segments[index].curve.getPointAt(Math.min(distance / routeLengths[index], 1), target);
      }
      distance -= routeLengths[index];
    }
    return target;
  };

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
  const signalPath = new Mesh(
    new TubeGeometry(signalCurve, 32, 0.012, 6, false),
    new MeshBasicMaterial({ color: palette.violet, transparent: true, opacity: 0.12 }),
  );
  scene.add(signalPath);

  // Cluster interior, revealed on J3: namespaces holding pods kept in sync.
  const interior = new Group();
  interior.position.set(layout.cluster.x, 0.3, layout.cluster.z);
  const plateMaterial = new MeshStandardMaterial({
    color: palette.puck,
    roughness: 0.9,
    transparent: true,
    opacity: 0,
  });
  const plate = new Mesh(new BoxGeometry(3.3, 0.06, 2.3), plateMaterial);
  const plateEdges = new LineSegments(
    new EdgesGeometry(plate.geometry),
    new LineBasicMaterial({ color: palette.paper, transparent: true, opacity: 0 }),
  );
  interior.add(plate, plateEdges);

  const trayMaterial = new LineBasicMaterial({ color: palette.violet, transparent: true, opacity: 0 });
  const trayGeometry = new EdgesGeometry(new BoxGeometry(0.92, 0.02, 1.9));
  namespaces.forEach((_, index) => {
    const tray = new LineSegments(trayGeometry, trayMaterial);
    tray.position.set((index - 1) * 1.05, 0.05, 0);
    interior.add(tray);
  });

  const podMaterial = new MeshStandardMaterial({ roughness: 0.6, transparent: true, opacity: 0 });
  const pods = new InstancedMesh(
    new BoxGeometry(0.22, 0.22, 0.22),
    podMaterial,
    namespaces.length * podsPerNamespace,
  );
  const podBase: Vector3[] = [];
  namespaces.forEach((_, ns) => {
    for (let pod = 0; pod < podsPerNamespace; pod += 1) {
      podBase.push(
        new Vector3((ns - 1) * 1.05 + (pod % 2 === 0 ? -0.2 : 0.2), 0.16, -0.6 + Math.floor(pod / 2) * 0.6),
      );
    }
  });
  interior.add(pods);
  scene.add(interior);

  // GitOps sync link into the opened cluster: the source of the pod wave.
  const syncMaterial = new MeshBasicMaterial({ color: palette.amber, transparent: true, opacity: 0 });
  const syncLink = new Mesh(
    new TubeGeometry(
      new QuadraticBezierCurve3(
        point("gitops", 0.3),
        new Vector3((layout.gitops.x + layout.cluster.x) / 2 - 0.3, 1.4, (layout.gitops.z + layout.cluster.z) / 2),
        new Vector3(layout.cluster.x - 1.3, 0.62, layout.cluster.z),
      ),
      32,
      0.022,
      6,
      false,
    ),
    syncMaterial,
  );
  scene.add(syncLink);

  // HTML labels, positioned from the projected 3D anchors.
  const makeLabel = (name: string, meta?: string, extraClass?: string) => {
    const element = document.createElement("div");
    element.className = [classNames.label, extraClass].filter(Boolean).join(" ");
    const nameElement = document.createElement("span");
    nameElement.className = classNames.name;
    nameElement.textContent = name;
    element.append(nameElement);
    let metaElement: HTMLSpanElement | undefined;
    if (meta !== undefined) {
      metaElement = document.createElement("span");
      metaElement.className = classNames.meta;
      metaElement.textContent = meta;
      element.append(metaElement);
    }
    labelLayer.append(element);
    return { element, metaElement };
  };

  const nodeLabels = options.nodes.map((node) => ({
    key: node.key,
    examples: node.examples,
    anchor: new Vector3(layout[node.key].x, 0.3, layout[node.key].z + layout[node.key].radius + 0.35),
    ...makeLabel(node.label, node.examples),
  }));
  const namespaceLabels = namespaces.map((name, index) => ({
    anchor: new Vector3(layout.cluster.x + (index - 1) * 0.84, 0.6, layout.cluster.z - 0.92),
    ...makeLabel(name, undefined, classNames.namespace),
  }));

  // State eased every frame toward the values the progress implies.
  let progress = 0;
  let pageIndex = 0;
  let width = 1;
  let height = 1;
  let portrait = false;
  let compact = false;
  let freeLeft = 8;
  let freeRight = 8;
  const cameraPosition = new Vector3();
  const cameraTarget = new Vector3();
  const desiredPosition = new Vector3();
  const desiredTarget = new Vector3();
  const nextPosition = new Vector3();
  const nextTarget = new Vector3();
  const scratch = new Vector3();
  const podColor = new Color();
  const yAxis = new Vector3(0, 1, 0);
  const matrix = new Matrix4();
  const dummy = new Object3D();
  let reveal = 0;
  let findings = 0;
  let initialised = false;
  let dirty = true;

  const framingAt = (index: number, position: Vector3, target: Vector3) => {
    const framing = framings[index];
    target.set(framing.target[0], framing.target[1], framing.target[2]);
    position.set(framing.offset[0], framing.offset[1], framing.offset[2]);
    if (portrait) {
      // Look down the chain so it recedes into depth instead of overflowing.
      position.applyAxisAngle(yAxis, -Math.PI / 2.6);
      position.multiplyScalar(index === 0 || index === 1 || index === 5 ? 1.08 : 1.15);
    }
    if (compact) {
      const wide = index === 0 || index === 1 || index === 5;
      position.multiplyScalar(wide ? 0.66 : index === 3 ? 0.46 : 0.78);
      if (wide) target.x += 0.45;
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
    // Phone band: the whole width is free, so the camera can come closer.
    compact = width < 900 && !portrait;
    // Wide screens: the sheet covers the left 40% and the index the right edge.
    // Mirrors .sheet: page gutter (30px max) + min(33rem, 40vw).
    freeLeft = width >= 900 ? Math.min(width * 0.4, 528) + 42 : 8;
    freeRight = width >= 900 ? 150 : 8;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Shift the optical centre away from the dossier sheet: to the right of
    // the left-hand sheet on wide screens, above the bottom sheet on phones.
    if (portrait) camera.setViewOffset(width, height, 0, height * 0.2, width, height);
    // Wide screens: centre the free band between the sheet and the index.
    else if (width >= 900) camera.setViewOffset(width, height, -width * 0.15, 0, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    dirty = true;
  };

  const allLitPage = () => pageIndex === 0 || pageIndex === pages.length - 1;

  const updateLabels = () => {
    for (const label of nodeLabels) {
      const node = nodeByKey[label.key];
      scratch.copy(label.anchor).project(camera);
      const x = (scratch.x * 0.5 + 0.5) * width;
      const y = (scratch.y * -0.5 + 0.5) * height;
      // A label only shows while its node is in the free part of the frame:
      // not cut by an edge, not under the dossier sheet or the page index.
      const half = label.element.offsetWidth / 2;
      const visible =
        scratch.z < 1 &&
        x - half > freeLeft &&
        x + half < width - freeRight &&
        y > 0 &&
        y + label.element.offsetHeight < height;
      label.element.style.transform = `translate(-50%, 0) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      const fade = label.key === "cluster" ? 1 - smoothstep(0, 0.4, reveal) : 1;
      label.element.style.opacity = visible ? String((0.35 + node.level * 0.65) * fade) : "0";
      label.element.dataset.focus = node.level > 0.7 ? "true" : "false";
      // On phones only the audited nodes keep their second line.
      label.element.dataset.detail = String(!compact || (node.level > 0.7 && !allLitPage()));
    }
    for (const label of namespaceLabels) {
      scratch.copy(label.anchor).project(camera);
      const x = (scratch.x * 0.5 + 0.5) * width;
      const y = (scratch.y * -0.5 + 0.5) * height;
      label.element.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      label.element.style.opacity = String(smoothstep(0.6, 1, reveal));
    }
  };

  const setPageLabels = (index: number) => {
    const page = pages[index];
    for (const label of nodeLabels) {
      if (!label.metaElement) continue;
      label.metaElement.textContent = page?.findings[label.key] ?? label.examples;
      label.element.dataset.finding = page?.findings[label.key] ? "true" : "false";
    }
  };

  let lastTime = performance.now();
  const frame = (time: number) => {
    if (reducedMotion && !dirty) return;
    const delta = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;
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
    const allLit = allLitPage();
    for (const node of nodeObjects) {
      const focused = page?.focus.includes(node.key);
      const target = focused ? 1 : pageIndex === 0 ? 0.85 : allLit ? 0.7 : 0.18;
      node.level += (target - node.level) * ease(4);
      node.accent.color.copy(palette.idle).lerp(palette.amber, smoothstep(0.3, 1, node.level));
      (node.footprint.material as MeshBasicMaterial).opacity = smoothstep(0.7, 1, node.level) * 0.5;
      const hasFinding = Boolean(pages[pages.length - 1]?.findings[node.key]);
      (node.pin.material as MeshBasicMaterial).opacity = hasFinding ? findings : 0;
      node.pin.position.y = 1.05 + (reducedMotion ? 0 : Math.sin(time / 700 + node.group.position.x) * 0.05);
      node.pin.rotation.y = reducedMotion ? 0 : time / 1600;
    }
    nodeByKey.cluster.body.scale.set(1, 1 - reveal * 0.5, 1);

    for (const segment of segments) {
      const lit = Math.min(nodeByKey[segment.from].level, nodeByKey[segment.to].level);
      segment.level += (lit - segment.level) * ease(4);
      segment.material.opacity = 0.12 + segment.level * 0.8;
    }

    const clock = reducedMotion ? 0 : time / 1000;
    for (let index = 0; index < routePackets; index += 1) {
      const t = (index / routePackets + clock * 0.035) % 1;
      routeAt(t, scratch);
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

    const revealTarget = smoothstep(2.35, 2.95, progress) * (1 - smoothstep(4.25, 4.85, progress));
    reveal += (revealTarget - reveal) * ease(3);
    const findingsTarget = smoothstep(4.4, 4.95, progress);
    findings += (findingsTarget - findings) * ease(3);

    interior.visible = reveal > 0.01;
    interior.position.y = 0.3 + reveal * 0.25;
    interior.scale.setScalar(0.3 + reveal * 0.5);
    plateMaterial.opacity = reveal * 0.96;
    (plateEdges.material as LineBasicMaterial).opacity = reveal * 0.3;
    trayMaterial.opacity = reveal * 0.55;
    podMaterial.opacity = reveal;
    syncMaterial.opacity = reveal * 0.9;
    syncLink.visible = reveal > 0.01;
    // A sync wave from GitOps: pods warm to amber one after the other.
    const wave = reducedMotion ? -1 : (time / 2400) % 1.6;
    podBase.forEach((base, index) => {
      const phase = index / podBase.length;
      const pulse = wave < 0 ? 0 : Math.max(0, 1 - Math.abs(wave - phase) * 8);
      dummy.position.copy(base);
      dummy.position.y += pulse * 0.08;
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      pods.setMatrixAt(index, dummy.matrix);
      // One staging pod has drifted from Git: it stays violet, out of sync.
      if (index === driftedPod) podColor.copy(palette.violet);
      else podColor.copy(palette.idle).lerp(palette.amber, pulse);
      pods.setColorAt(index, podColor);
    });
    pods.instanceMatrix.needsUpdate = true;
    if (pods.instanceColor) pods.instanceColor.needsUpdate = true;

    renderer.render(scene, camera);
    updateLabels();
    dirty = false;
  };

  resize();
  setPageLabels(0);
  renderer.setAnimationLoop(frame);

  return {
    setProgress(value) {
      progress = MathUtils.clamp(value, 0, pages.length - 1);
      const nextPage = Math.round(progress);
      if (nextPage !== pageIndex) {
        pageIndex = nextPage;
        setPageLabels(pageIndex);
      }
      dirty = true;
    },
    resize,
    dispose() {
      renderer.setAnimationLoop(null);
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
