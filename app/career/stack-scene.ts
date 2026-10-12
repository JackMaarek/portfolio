// Three.js scene of the career stack: the platform the missions built,
// layer by layer, on the offer's blueprint floor. The page scroll sets a
// continuous progress (0 = cover, then one page per mission, the project
// and the expertise). Every part of the stack names the mission that
// brought it (and the one that replaced it, if any): the cover shows the
// finished platform, then the stack is rebuilt from the first mission on.
// Imported lazily so the sheets render first.
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
  Fog,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
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
  type Curve,
} from "three";
import { createFitter, type FitPoint } from "../scene/fit";
import { createLabelPlacer, createLabels, type LabelClassNames, type SceneLabel } from "../scene/labels";
import { createLoop } from "../scene/loop";
import type { SceneFrame, SceneParts, ScrollScene } from "../scene/use-scroll-scene";

// The offer palette.
const palette = {
  ink: new Color("#0b0b0d"),
  block: new Color("#18171d"),
  idle: new Color("#5d5a68"),
  paper: new Color("#efedf5"),
  amber: new Color("#ffbd74"),
  violet: new Color("#aba2ff"),
};

const smoothstep = (edge0: number, edge1: number, value: number) => MathUtils.smoothstep(value, edge0, edge1);

// Mission keys, matched against the company names of the missions.
type Mission = "Hubert" | "Risk&Me" | "Padok" | "MIRAGE" | "PerspeQtive";

export type StackOptions = SceneParts & {
  // Company of each mission, in chronological order: one page each.
  missions: string[];
  // Capability names of the three tiers of the stack, bottom to top.
  tiers: { iac: string; platform: string; security: string };
  classNames: LabelClassNames;
};

// Camera framing per page: target on the floor and offset from it.
const framings = [
  { target: [0, 0.4, 0], offset: [8, 7.5, 12] },
  { target: [0.6, 0.5, 0.2], offset: [5, 4.5, 8] },
  { target: [0.3, 0.6, -0.2], offset: [-3, 6, 8] },
  { target: [0, 0.3, 0.4], offset: [2, 11, 9] },
  { target: [0, 0.4, 0], offset: [-6, 6, 9] },
  { target: [0.4, 0.6, 0.1], offset: [6, 5.5, 8] },
  { target: [-0.4, 0.6, 0.5], offset: [4, 8, 10] },
  { target: [0, 0.5, 0], offset: [10, 4, 9] },
] as const;

// Cluster plate, where the workloads run from 2019 on.
const cluster = { x: 0.3, z: -0.2, radius: 2.3, top: 0.44 };

type Part = {
  since: number;
  until?: number;
  // Pages on which the part is the subject (lit amber).
  focus: number[];
  group: Group;
  baseY: number;
  fills: MeshStandardMaterial[];
  accents: MeshBasicMaterial[];
  wires: LineBasicMaterial[];
  wireOpacity: number;
  label?: SceneLabel;
  // Where the camera must keep room for the part.
  center: Vector3;
  amount: number;
  level: number;
};

export function createStackScene(options: StackOptions): ScrollScene {
  const { canvas, labelLayer, reducedMotion, classNames, missions, tiers } = options;
  const loop = createLoop({ canvas, clearColor: palette.ink, reducedMotion, onContextLost: options.onContextLost });
  const { renderer, detail } = loop;

  const pageOf = (mission: Mission) => 1 + missions.findIndex((company) => company.includes(mission));
  const projectPage = missions.length + 1;
  const expertisePage = missions.length + 2;
  const pageCount = missions.length + 3;

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
  for (let i = -24; i <= 24; i += 1) gridLines.push(i, 0, -24, i, 0, 24, -24, 0, i, 24, 0, i);
  const gridGeometry = new BufferGeometry();
  gridGeometry.setAttribute("position", new Float32BufferAttribute(gridLines, 3));
  scene.add(
    new LineSegments(gridGeometry, new LineBasicMaterial({ color: palette.paper, transparent: true, opacity: 0.07 })),
  );

  const labels = createLabels(labelLayer, classNames);
  const placeLabels = createLabelPlacer();

  // Parts of the stack ------------------------------------------------------

  const parts: Part[] = [];
  const part = (
    since: number,
    options: { until?: number; focus?: number[]; label?: string; tone?: "node" | "tag"; at?: Vector3; wireOpacity?: number } = {},
  ) => {
    const group = new Group();
    scene.add(group);
    const entry: Part = {
      since,
      until: options.until,
      focus: options.focus ?? [since],
      group,
      baseY: 0,
      fills: [],
      accents: [],
      wires: [],
      wireOpacity: options.wireOpacity ?? 0.35,
      center: options.at?.clone() ?? new Vector3(),
      amount: 0,
      level: 0.3,
    };
    if (options.label) {
      entry.label = labels.add(options.label, { tone: options.tone ?? "node", above: true });
      entry.label.anchor.copy(entry.center).setY(entry.center.y + 0.25);
    }
    parts.push(entry);
    return entry;
  };

  // A matte block with a lit top face and paper edges.
  const block = (target: Part, size: [number, number, number], at: [number, number, number], top = true) => {
    const [w, h, d] = size;
    const fill = new MeshStandardMaterial({ color: palette.block, roughness: 0.85, metalness: 0.1, transparent: true });
    const body = new Mesh(new BoxGeometry(w, h, d), fill);
    body.position.set(at[0], at[1] + h / 2, at[2]);
    target.group.add(body);
    target.fills.push(fill);
    const wire = new LineBasicMaterial({ color: palette.paper, transparent: true, opacity: 0 });
    const edges = new LineSegments(new EdgesGeometry(body.geometry), wire);
    edges.position.copy(body.position);
    target.group.add(edges);
    target.wires.push(wire);
    if (top) {
      const accent = new MeshBasicMaterial({ color: palette.idle.clone(), transparent: true });
      const face = new Mesh(new BoxGeometry(w * 0.82, 0.012, d * 0.82), accent);
      face.position.set(at[0], at[1] + h + 0.007, at[2]);
      target.group.add(face);
      target.accents.push(accent);
    }
    return body;
  };

  // A floor puck with an accent ring, like the offer's chain nodes.
  const puck = (target: Part, radius: number, at: [number, number, number]) => {
    const fill = new MeshStandardMaterial({ color: palette.block, roughness: 0.85, metalness: 0.1, transparent: true });
    const body = new Mesh(new CylinderGeometry(radius, radius * 1.04, 0.24, detail(40, 24)), fill);
    body.position.set(at[0], at[1] + 0.12, at[2]);
    const accent = new MeshBasicMaterial({ color: palette.idle.clone(), transparent: true });
    const ring = new Mesh(new RingGeometry(radius * 0.7, radius * 0.84, detail(40, 24)), accent);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(at[0], at[1] + 0.245, at[2]);
    target.group.add(body, ring);
    target.fills.push(fill);
    target.accents.push(accent);
  };

  // Violet outline: what is described rather than built (IaC, containers).
  const outline = (target: Part, size: [number, number, number], at: [number, number, number]) => {
    const wire = new LineBasicMaterial({ color: palette.violet, transparent: true, opacity: 0 });
    const lines = new LineSegments(new EdgesGeometry(new BoxGeometry(...size)), wire);
    lines.position.set(...at);
    target.group.add(lines);
    target.wires.push(wire);
  };

  const hubert = pageOf("Hubert");
  const riskAndMe = pageOf("Risk&Me");
  const padok = pageOf("Padok");
  const mirage = pageOf("MIRAGE");
  const perspeqtive = pageOf("PerspeQtive");

  // 2018: a Symfony monolith in Docker with its MySQL database, on one AWS
  // account described in Terraform.
  const aws = part(hubert, { until: padok, label: "AWS", at: new Vector3(-2.6, 0.2, 2.1) });
  block(aws, [7, 0.2, 4.6], [0, 0, 0], false);
  const terraform = part(hubert, {
    focus: [hubert, riskAndMe, mirage],
    label: "Terraform",
    at: new Vector3(-3.8, 0.5, -2.6),
    wireOpacity: 0.55,
  });
  outline(terraform, [7.6, 0.5, 5.2], [0, 0.25, 0]);
  const monolith = part(hubert, { until: riskAndMe, label: "Symfony", at: new Vector3(cluster.x, 1.3, cluster.z) });
  block(monolith, [1.6, 1.1, 1.2], [cluster.x, 0.2, cluster.z]);
  const docker = part(hubert, { until: riskAndMe, label: "Docker", tone: "tag", at: new Vector3(cluster.x + 1, 0.9, cluster.z + 0.75) });
  outline(docker, [1.9, 1.3, 1.5], [cluster.x, 0.85, cluster.z]);
  const mysql = part(hubert, { label: "MySQL", at: new Vector3(2.6, 0.9, 1.2) });
  {
    const fill = new MeshStandardMaterial({ color: palette.block, roughness: 0.8, transparent: true });
    const body = new Mesh(new CylinderGeometry(0.45, 0.45, 0.7, detail(32, 20)), fill);
    body.position.set(2.6, 0.55, 1.2);
    const accent = new MeshBasicMaterial({ color: palette.idle.clone(), transparent: true });
    const cap = new Mesh(new CylinderGeometry(0.38, 0.38, 0.012, detail(32, 20)), accent);
    cap.position.set(2.6, 0.91, 1.2);
    mysql.group.add(body, cap);
    mysql.fills.push(fill);
    mysql.accents.push(accent);
  }

  // 2019: the monolith becomes Go microservices on a production Kubernetes
  // cluster, with its worker nodes.
  const kubernetes = part(riskAndMe, {
    focus: [riskAndMe, perspeqtive],
    label: "Kubernetes",
    at: new Vector3(cluster.x - cluster.radius + 0.3, cluster.top, cluster.z + 1.6),
  });
  {
    const fill = new MeshStandardMaterial({ color: palette.block, roughness: 0.9, transparent: true });
    const plate = new Mesh(new CylinderGeometry(cluster.radius, cluster.radius, 0.16, 6), fill);
    plate.position.set(cluster.x, cluster.top - 0.08, cluster.z);
    const wire = new LineBasicMaterial({ color: palette.paper, transparent: true, opacity: 0 });
    const edges = new LineSegments(new EdgesGeometry(plate.geometry), wire);
    edges.position.copy(plate.position);
    kubernetes.group.add(plate, edges);
    kubernetes.fills.push(fill);
    kubernetes.wires.push(wire);
  }
  const nodeSpots = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2 + Math.PI / 8;
    return [cluster.x + Math.cos(angle) * 1.75, cluster.top, cluster.z + Math.sin(angle) * 1.75] as [number, number, number];
  });
  // Half the worker nodes go with the cost reduction at Padok.
  const keptNodes = part(riskAndMe, { focus: [riskAndMe] });
  const droppedNodes = part(riskAndMe, { until: padok, focus: [riskAndMe, padok] });
  nodeSpots.forEach((spot, index) => block(index % 2 === 0 ? keptNodes : droppedNodes, [0.42, 0.14, 0.42], spot));
  // Label-only part: it names the nodes leaving the cluster.
  part(padok, {
    until: mirage,
    label: "−50% de coûts",
    tone: "tag",
    at: new Vector3(nodeSpots[1][0], 0.7, nodeSpots[1][2]),
  });
  const services = [
    [-0.55, -0.6],
    [0.6, -0.75],
    [-0.65, 0.35],
    [0.65, 0.25],
  ].map(([x, z]) => [cluster.x + x, cluster.top, cluster.z + z] as [number, number, number]);
  const microservices = part(riskAndMe, {
    label: "Microservices Go",
    at: new Vector3(cluster.x, cluster.top + 0.75, cluster.z - 0.7),
  });
  services.forEach((spot) => block(microservices, [0.5, 0.5, 0.5], spot));

  // 2021: multi-account AWS, GitOps with ArgoCD, half the cost and about
  // 150 teams supported day to day.
  const accounts = part(padok, { label: "Multi-comptes AWS", at: new Vector3(-2.4, 0.2, 2.1) });
  for (const x of [-2.4, 0, 2.4]) block(accounts, [2.2, 0.2, 4.6], [x, 0, 0], false);
  const argocd = part(padok, { label: "ArgoCD", at: new Vector3(-4.6, 0.4, 1.2) });
  puck(argocd, 0.45, [-4.6, 0, 1.2]);
  const teams = part(padok, { until: mirage, label: "≈150 équipes", tone: "tag", at: new Vector3(3.6, 0.2, 2.6) });
  const teamCount = 150;
  const teamDots = new InstancedMesh(
    new SphereGeometry(0.035, 6, 4),
    new MeshBasicMaterial({ color: palette.violet, transparent: true, opacity: 0 }),
    teamCount,
  );
  {
    const dummy = new Object3D();
    for (let index = 0; index < teamCount; index += 1) {
      // Golden-angle spread over a ring around the stack.
      const angle = index * 2.39996;
      const radius = 4.1 + ((index * 37) % 100) / 100 * 0.9;
      dummy.position.set(Math.cos(angle) * radius, 0.04, Math.sin(angle) * radius * 0.8);
      dummy.updateMatrix();
      teamDots.setMatrixAt(index, dummy.matrix);
    }
    teams.group.add(teamDots);
  }

  // 2023: the CI/CD toolchain into the cluster and the dashboards it feeds.
  const ci = part(mirage, { label: "GitLab CI", at: new Vector3(-4.6, 0.4, -1.6) });
  puck(ci, 0.45, [-4.6, 0, -1.6]);
  const observability = part(mirage, { focus: [mirage], label: "Prometheus · Grafana", at: new Vector3(4.8, 1.1, 1.6) });
  puck(observability, 0.5, [4.8, 0, 1.6]);
  const bars = [-0.22, 0, 0.22].map((offset) => {
    const accent = new MeshBasicMaterial({ color: palette.idle.clone(), transparent: true });
    const bar = new Mesh(new BoxGeometry(0.13, 1, 0.13), accent);
    bar.position.set(4.8 + offset, 0.25, 1.6);
    observability.group.add(bar);
    observability.accents.push(accent);
    return bar;
  });

  // 2025: GPU nodes fed by event-driven processing from S3.
  const gpu = part(perspeqtive, { label: "GPU", at: new Vector3(cluster.x - 0.2, cluster.top + 1, cluster.z + 1.35) });
  for (const x of [-0.75, 0.35]) {
    block(gpu, [0.5, 0.7, 0.5], [cluster.x + x, cluster.top, cluster.z + 1.35]);
  }
  const s3 = part(perspeqtive, { label: "S3", at: new Vector3(3, 0.95, -1.6) });
  {
    const fill = new MeshStandardMaterial({ color: palette.block, roughness: 0.8, transparent: true });
    const body = new Mesh(new CylinderGeometry(0.5, 0.42, 0.5, detail(32, 20)), fill);
    body.position.set(3, 0.45, -1.6);
    const accent = new MeshBasicMaterial({ color: palette.idle.clone(), transparent: true });
    const cap = new Mesh(new CylinderGeometry(0.44, 0.44, 0.012, detail(32, 20)), accent);
    cap.position.set(3, 0.71, -1.6);
    s3.group.add(body, cap);
    s3.fills.push(fill);
    s3.accents.push(accent);
  }

  // k8s-platform: mTLS between workloads, admission policies, external
  // secrets and the CLI that prepares the environments.
  const mesh = part(projectPage, { label: "Istio mTLS", tone: "tag", at: new Vector3(cluster.x + 0.05, cluster.top + 0.9, cluster.z) });
  {
    const points: number[] = [];
    const ends = [...services, ...[-0.75, 0.35].map((x) => [cluster.x + x, cluster.top, cluster.z + 1.35])];
    for (let a = 0; a < ends.length; a += 1) {
      for (let b = a + 1; b < ends.length; b += 1) {
        if (Math.hypot(ends[a][0] - ends[b][0], ends[a][2] - ends[b][2]) > 1.6) continue;
        points.push(ends[a][0], cluster.top + 0.62, ends[a][2], ends[b][0], cluster.top + 0.62, ends[b][2]);
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
    const wire = new LineBasicMaterial({ color: palette.violet, transparent: true, opacity: 0 });
    mesh.group.add(new LineSegments(geometry, wire));
    mesh.wires.push(wire);
    mesh.wireOpacity = 0.8;
  }
  const kyverno = part(projectPage, { label: "Kyverno", tone: "tag", at: new Vector3(-2.3, 0.85, -0.9) });
  {
    const accent = new MeshBasicMaterial({ color: palette.idle.clone(), transparent: true });
    for (const z of [-1.3, -0.5]) {
      const post = new Mesh(new BoxGeometry(0.05, 0.5, 0.05), accent);
      post.position.set(-2.3, 0.45, z);
      kyverno.group.add(post);
    }
    const bar = new Mesh(new BoxGeometry(0.05, 0.05, 0.86), accent);
    bar.position.set(-2.3, 0.7, -0.9);
    kyverno.group.add(bar);
    kyverno.accents.push(accent);
  }
  const secrets = part(projectPage, { label: "External Secrets", tone: "tag", at: new Vector3(2.1, 1.25, -1.5) });
  {
    const accent = new MeshBasicMaterial({ color: palette.idle.clone(), transparent: true });
    const gem = new Mesh(new OctahedronGeometry(0.2), accent);
    gem.position.set(2.1, 0.95, -1.5);
    secrets.group.add(gem);
    secrets.accents.push(accent);
  }
  const bot = part(projectPage, { label: "platform-bot", at: new Vector3(-3.2, 0.4, 3.4) });
  puck(bot, 0.4, [-3.2, 0, 3.4]);

  // Flows ------------------------------------------------------------------

  const packetGeometry = new SphereGeometry(0.06, 10, 6);
  type Flow = {
    curve: Curve<Vector3>;
    mesh: InstancedMesh;
    material: MeshBasicMaterial;
    track: MeshBasicMaterial;
    owner: Part;
    speed: number;
  };
  const flows: Flow[] = [];
  const flow = (owner: Part, from: Vector3, via: Vector3, to: Vector3, color: Color, count: number, speed: number) => {
    const curve = new QuadraticBezierCurve3(from, via, to);
    const track = new MeshBasicMaterial({ color, transparent: true, opacity: 0 });
    owner.group.add(new Mesh(new TubeGeometry(curve, 24, 0.014, 6, false), track));
    const material = new MeshBasicMaterial({ color, transparent: true, opacity: 0 });
    const mesh = new InstancedMesh(packetGeometry, material, count);
    owner.group.add(mesh);
    flows.push({ curve, mesh, material, track, owner, speed });
  };
  const clusterTop = new Vector3(cluster.x, cluster.top + 0.3, cluster.z);
  flow(ci, new Vector3(-4.6, 0.3, -1.6), new Vector3(-2.4, 1.6, -1.4), clusterTop, palette.amber, 6, 0.09);
  flow(argocd, new Vector3(-4.6, 0.3, 1.2), new Vector3(-2.4, 1.8, 1.2), clusterTop, palette.amber, 4, 0.06);
  flow(observability, clusterTop, new Vector3(3, 1.8, 1), new Vector3(4.8, 0.4, 1.6), palette.violet, 5, 0.08);
  flow(s3, new Vector3(3, 0.75, -1.6), new Vector3(2, 1.8, 0.6), new Vector3(cluster.x - 0.2, cluster.top + 0.75, cluster.z + 1.35), palette.amber, 5, 0.07);

  // The three tiers, named on the expertise page.
  const tierLabels = [
    { text: tiers.iac, at: new Vector3(-3.9, 0.15, -2.7) },
    { text: tiers.platform, at: new Vector3(-3.9, 0.55, -2.7) },
    { text: tiers.security, at: new Vector3(-3.9, 1.05, -2.7) },
  ].map(({ text, at }) => {
    const label = labels.add(text, { tone: "axis", spots: ["left", "above", "right"] });
    label.anchor.copy(at);
    label.priority = 3;
    return label;
  });

  // Presence of a part at a progress value: built from its mission on,
  // gone once replaced. The cover shows the finished platform and dissolves
  // into the first mission.
  const presence = (entry: Part, at: number) => {
    const built = smoothstep(entry.since - 0.7, entry.since - 0.15, at);
    const kept = entry.until === undefined ? 1 : 1 - smoothstep(entry.until - 0.7, entry.until - 0.15, at);
    const cover = 1 - smoothstep(0.35, 0.9, at);
    return cover * (entry.until === undefined ? 1 : 0) + (1 - cover) * built * kept;
  };

  // State eased every frame toward the values the progress implies.
  let progress = 0;
  let pageIndex = 0;
  let width = 1;
  let height = 1;
  let compact = false;
  let free: SceneFrame = { band: false, left: 0, right: 0, top: 0 };
  const fit = framings.map(() => 1);
  let initialised = false;
  const cameraPosition = new Vector3();
  const cameraTarget = new Vector3();
  const desiredPosition = new Vector3();
  const desiredTarget = new Vector3();
  const nextPosition = new Vector3();
  const nextTarget = new Vector3();
  const scratch = new Vector3();
  const dummy = new Object3D();
  let tierShown = 0;

  const framingIndex = (index: number) => Math.min(index, framings.length - 1);
  const baseFraming = (index: number, offset: Vector3, target: Vector3) => {
    const framing = framings[framingIndex(index)];
    target.set(framing.target[0], framing.target[1], framing.target[2]);
    offset.set(framing.offset[0], framing.offset[1], framing.offset[2]);
  };
  const framingAt = (index: number, position: Vector3, target: Vector3) => {
    baseFraming(index, position, target);
    position.multiplyScalar(fit[framingIndex(index)]).add(target);
  };

  // What each page must show: the stack as it stands that year, with the
  // room the labels of its subject need.
  const mustSee = (index: number): FitPoint[] => {
    const points: FitPoint[] = [];
    for (const entry of parts) {
      if (presence(entry, index) < 0.5) continue;
      points.push({ at: entry.center, padX: 24, padTop: 16, padBottom: 12 });
      if (entry.label && entry.focus.includes(index)) {
        points.push({ at: entry.label.anchor, padX: entry.label.width / 2 + 6, padTop: entry.label.height + 6, padBottom: 0 });
      }
    }
    if (index === expertisePage) {
      for (const label of tierLabels) points.push({ at: label.anchor, padX: 12, padTop: 10, padBottom: 10 });
    }
    return points;
  };

  const closestScale = createFitter(camera);
  const fitOffset = new Vector3();
  const fitTarget = new Vector3();
  // Optical centre: the middle of the free part of the frame. On the cover
  // it also sits below the site header; that shift eases out with the scroll.
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
      const core = closest(all.map((point) => ({ ...point, padX: Math.min(point.padX, 28), padTop: Math.min(point.padTop, 16) })));
      const full = closest(all);
      fit[index] = Math.min(full, core * 1.3) * 1.04;
    });
    appliedShift = Number.NaN;
    initialised = false;
  };

  const resize = () => {
    width = canvas.clientWidth || 1;
    height = canvas.clientHeight || 1;
    compact = free.band;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    labels.measure();
    fitFramings();
    loop.invalidate();
  };

  const computeDesired = () => {
    const index = Math.min(Math.floor(progress), pageCount - 1);
    const next = Math.min(index + 1, pageCount - 1);
    const t = MathUtils.smootherstep(progress - index, 0.15, 0.85);
    framingAt(index, desiredPosition, desiredTarget);
    framingAt(next, nextPosition, nextTarget);
    desiredPosition.lerp(nextPosition, t);
    desiredTarget.lerp(nextTarget, t);
  };

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
    const distance = camera.position.distanceTo(cameraTarget);
    fog.near = distance + 4;
    fog.far = distance + 34;
    initialised = true;
    const settled =
      cameraPosition.distanceToSquared(desiredPosition) < 1e-4 &&
      cameraTarget.distanceToSquared(desiredTarget) < 1e-4;

    // The cover and the expertise page show the whole platform lit.
    const overview = pageIndex === 0 || pageIndex === expertisePage;
    for (const entry of parts) {
      const target = presence(entry, progress);
      entry.amount += (target - entry.amount) * ease(3);
      if (Math.abs(entry.amount - target) < 0.001) entry.amount = target;
      const focused = entry.focus.includes(pageIndex);
      const lit = focused ? 1 : overview ? 0.7 : 0.3;
      entry.level += (lit - entry.level) * ease(4);
      const shown = entry.amount > 0.005;
      entry.group.visible = shown;
      if (entry.label) {
        entry.label.alpha = shown ? entry.amount * (focused ? 1 : compact ? 0 : 0.55) : 0;
        entry.label.element.dataset.focus = focused ? "true" : "false";
      }
      if (!shown) continue;
      // Parts settle onto the stack from just above it.
      entry.group.position.y = (1 - entry.amount) * 0.8;
      for (const fill of entry.fills) fill.opacity = entry.amount;
      for (const wire of entry.wires) wire.opacity = entry.amount * entry.wireOpacity * (0.5 + 0.5 * entry.level);
      const warmth = smoothstep(0.3, 1, entry.level);
      for (const accent of entry.accents) {
        accent.color.copy(palette.idle).lerp(palette.amber, warmth);
        accent.opacity = entry.amount;
      }
    }
    teamDots.material.opacity = teams.amount * 0.8;

    const clock = reducedMotion ? 0 : time / 1000;
    for (const { curve, mesh, material, track, owner, speed } of flows) {
      material.opacity = owner.amount * (0.35 + 0.55 * owner.level);
      track.opacity = owner.amount * 0.2;
      if (owner.amount <= 0.005) continue;
      for (let index = 0; index < mesh.count; index += 1) {
        const t = (index / mesh.count + clock * speed) % 1;
        curve.getPointAt(t, scratch);
        dummy.position.copy(scratch);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (observability.amount > 0.005) {
      bars.forEach((bar, index) => {
        const level = reducedMotion ? 0.5 + index * 0.15 : 0.45 + 0.25 * Math.sin(clock * (0.9 + index * 0.4) + index);
        bar.scale.y = Math.max(level * observability.amount, 0.001);
        bar.position.y = 0.25 + bar.scale.y / 2;
      });
    }
    if (!reducedMotion && teams.amount > 0.005) teams.group.rotation.y = clock * 0.03;

    tierShown += ((pageIndex === expertisePage ? 1 : 0) - tierShown) * ease(3);
    for (const label of tierLabels) label.alpha = tierShown;

    renderer.render(scene, camera);
    return {
      settled,
      placementChanged: placeLabels(labels.labels, camera, { width, height, left: free.left, right: free.right, compact }),
    };
  });

  resize();

  return {
    setProgress(value) {
      progress = MathUtils.clamp(value, 0, pageCount - 1);
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
