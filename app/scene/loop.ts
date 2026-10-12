// Renderer and render loop shared by the scroll scenes. The loop only runs
// while the page reports the scene in view, renders at half rate once the
// scene has settled, lowers the pixel ratio when frames keep running long,
// renders on demand with reduced motion and stops for good if the GPU drops
// the context.
import {
  type Color,
  InstancedMesh,
  LineSegments,
  type Material,
  Mesh,
  type Scene,
  Vector2,
  WebGLRenderer,
} from "three";

// What a frame reports back: whether the camera has settled (only idle
// motion left) and whether a label appeared or disappeared.
export type FrameReport = { settled: boolean; placementChanged: boolean };
export type RenderFrame = (time: number, delta: number) => FrameReport;

type LoopOptions = {
  canvas: HTMLCanvasElement;
  clearColor: Color;
  reducedMotion: boolean;
  onContextLost: () => void;
};

const idleInterval = 1000 / 30;

export function createLoop({ canvas, clearColor, reducedMotion, onContextLost }: LoopOptions) {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  // Pixel ratio starts capped and only ever steps down if frames run long.
  let pixelRatio = Math.min(window.devicePixelRatio, coarse ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(clearColor);

  let render: RenderFrame | null = null;
  let active = false;
  let lost = false;
  let dirty = true;
  let settling = false;
  let settled = false;
  let watching = false;
  let lastTime = performance.now();

  // Frame budget watch: if frames keep running long, lower the pixel ratio.
  const size = new Vector2();
  let slowFrames = 0;
  let sampledFrames = 0;
  const watchFrameTime = (delta: number) => {
    if (reducedMotion || pixelRatio <= 1) return;
    sampledFrames += 1;
    if (delta > 1 / 40) slowFrames += 1;
    if (sampledFrames < 90) return;
    if (slowFrames > 45) {
      pixelRatio = Math.max(1, pixelRatio - 0.25);
      renderer.getSize(size);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(size.x, size.y, false);
    }
    slowFrames = 0;
    sampledFrames = 0;
  };

  const frame = (time: number) => {
    if (!render || (reducedMotion && !dirty)) return;
    // Once settled only the idle motion is left: it runs at half rate.
    if (settled && !dirty && time - lastTime < idleInterval - 2) return;
    const delta = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;
    // Frames spaced by the idle cap are not slow frames.
    if (watching && !settled) watchFrameTime(delta);
    watching = true;
    const report = render(time, delta);
    settled = report.settled;
    // Reduced motion renders on demand: one more pass lets the elements that
    // follow a label catch up with where it was just placed.
    dirty = report.placementChanged && !settling;
    settling = dirty;
  };

  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    renderer.setAnimationLoop(null);
    onContextLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  return {
    renderer,
    // Coarse pointers get lighter geometry.
    detail: (fine: number, rough: number) => (coarse ? rough : fine),
    start(next: RenderFrame) {
      render = next;
    },
    // Something changed (progress, size): the next frame must render.
    invalidate() {
      dirty = true;
    },
    setActive(value: boolean) {
      if (value === active || lost) return;
      active = value;
      lastTime = performance.now();
      watching = false;
      dirty = true;
      renderer.setAnimationLoop(active ? frame : null);
    },
    dispose(scene: Scene) {
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("webglcontextlost", onLost);
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof LineSegments || object instanceof InstancedMesh) {
          object.geometry.dispose();
          const materials: Material[] = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    },
  };
}

export type Loop = ReturnType<typeof createLoop>;
