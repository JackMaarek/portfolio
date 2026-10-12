// Page side of a scroll scene: sheets scroll over a pinned WebGL stage and
// the scroll position sets a continuous page progress. The scene module is
// imported only when the stage nears the viewport, renders only while it is
// in view, and the page stays fully readable without it.
import { useEffect, useRef, useState } from "react";

// Band layout (scene above, sheets below): phones and tablets. Landscape
// phones (short viewports) keep the side layout. Mirrors the media query in
// scene.module.css.
export const bandQuery = "(max-width: 599px), (max-width: 1180px) and (min-height: 500px)";

// Free part of the canvas, in CSS pixels: what the sheet, the page index
// and the site header leave visible. `band` is the phone/tablet layout.
export type SceneFrame = { band: boolean; left: number; right: number; top: number };

export type ScrollScene = {
  setProgress: (progress: number) => void;
  setFrame: (frame: SceneFrame) => void;
  setActive: (active: boolean) => void;
  dispose: () => void;
};

export type SceneParts = {
  canvas: HTMLCanvasElement;
  labelLayer: HTMLElement;
  reducedMotion: boolean;
  onContextLost: () => void;
};

// Continuous page position: 0 on the first sheet, 1 on the second,
// fractions in between. Wide screens: a page is current when its sheet is
// centred in the viewport. Band layout: a page is current once its sheet
// reaches the band; the camera moves in the gap before the next one.
function readProgress(sections: HTMLElement[], stage: HTMLElement | null, band: boolean) {
  const anchor = band && stage ? stage.getBoundingClientRect().bottom + 24 : window.innerHeight / 2;
  const marks = sections.map((section) => {
    const rect = section.getBoundingClientRect();
    return band ? rect.top : rect.top + rect.height / 2;
  });
  if (anchor <= marks[0]) return 0;
  for (let index = 0; index < marks.length - 1; index += 1) {
    if (anchor < marks[index + 1]) {
      const fraction = (anchor - marks[index]) / (marks[index + 1] - marks[index]);
      if (!band) return index + fraction;
      const t = Math.min(Math.max((fraction - 0.7) / 0.3, 0), 1);
      return index + t * t * (3 - 2 * t);
    }
  }
  return marks.length - 1;
}

// `load` must be stable (declared at module level).
export function useScrollScene(load: (parts: SceneParts) => Promise<ScrollScene>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<HTMLElement[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [indexShown, setIndexShown] = useState(false);
  const [sceneState, setSceneState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    const labelLayer = labelsRef.current;
    const root = rootRef.current;
    if (!canvas || !labelLayer || !root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bandMedia = window.matchMedia(bandQuery);
    let scene: ScrollScene | undefined;
    let disposed = false;
    let loading = false;
    let near = false;
    let pending = 0;

    const sync = () => {
      pending = 0;
      const progress = readProgress(sectionRefs.current, stageRef.current, bandMedia.matches);
      scene?.setProgress(progress);
      setActivePage(Math.round(progress));
    };
    // Scroll far from the scene reads no layout: progress only moves while
    // it is near the viewport.
    const onScroll = () => {
      if (near && !pending) pending = requestAnimationFrame(sync);
    };

    // Pause rendering once the scene has scrolled out of view.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      scene?.setActive(entry.isIntersecting);
    });
    // The fixed page index only shows while the scene holds the middle of
    // the viewport, not over the sections before or after it.
    const indexObserver = new IntersectionObserver(
      ([entry]) => setIndexShown(entry.isIntersecting),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    indexObserver.observe(root);

    // Tell the scene which part of the canvas is free: beside the sheet and
    // the index on wide screens, the whole band on phones.
    const measureFrame = () => {
      const stage = stageRef.current;
      const sheet = sectionRefs.current[0]?.querySelector("article");
      const index = indexRef.current;
      if (!stage || !sheet || !index) return;
      const stageRect = stage.getBoundingClientRect();
      // The site header only overlaps the stage when the scene opens the page.
      const topbar = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const top = Math.max(topbar - stageRect.top, 0) + 4;
      if (bandMedia.matches) {
        scene?.setFrame({ band: true, left: 0, right: 0, top });
        return;
      }
      scene?.setFrame({
        band: false,
        left: sheet.getBoundingClientRect().right - stageRect.left + 16,
        right: stageRect.right - index.getBoundingClientRect().left + 12,
        top,
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      measureFrame();
      onScroll();
    });

    // Three.js and the WebGL context are only paid for by visitors who
    // scroll towards the scene.
    const loadScene = () => {
      if (loading) return;
      loading = true;
      load({ canvas, labelLayer, reducedMotion, onContextLost: () => setSceneState("unavailable") })
        .then((created) => {
          if (disposed) {
            created.dispose();
            return;
          }
          scene = created;
          measureFrame();
          resizeObserver.observe(canvas);
          visibilityObserver.observe(root);
          sync();
          setSceneState("ready");
        })
        // No WebGL (or the chunk failed): the sheets stay fully readable.
        .catch(() => setSceneState("unavailable"));
    };

    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (!near) return;
        loadScene();
        onScroll();
      },
      { rootMargin: "50% 0px" },
    );
    nearObserver.observe(root);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      indexObserver.disconnect();
      nearObserver.disconnect();
      if (pending) cancelAnimationFrame(pending);
      scene?.dispose();
    };
  }, [load]);

  const goToPage = (index: number) => {
    const section = sectionRefs.current[index];
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const band = window.matchMedia(bandQuery).matches;
    const bandHeight = band ? (stageRef.current?.offsetHeight ?? 0) : 0;
    const rect = section.getBoundingClientRect();
    const top = band
      ? window.scrollY + rect.top - bandHeight
      : window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    section.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  };

  const sectionRef = (index: number) => (element: HTMLElement | null) => {
    if (element) sectionRefs.current[index] = element;
  };

  return {
    canvasRef,
    labelsRef,
    stageRef,
    rootRef,
    indexRef,
    sectionRef,
    activePage,
    indexShown,
    sceneState,
    goToPage,
  };
}
