"use client";

import { useEffect, useRef, useState } from "react";

// Maps the scroll position inside a tall pinned section to a phase index.
// One layout read per frame; React only re-renders when the phase changes.
export function useScrollPhase(phaseCount: number) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
        setPhase(phaseCount - 1);
        return;
      }
      const bounds = section.getBoundingClientRect();
      const range = Math.max(bounds.height - window.innerHeight, 1);
      const progress = Math.min(Math.max(-bounds.top / range, 0), 1);
      section.style.setProperty("--scene-progress", progress.toFixed(3));
      setPhase(Math.min(Math.floor(progress * phaseCount), phaseCount - 1));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    section.dataset.live = "true";
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reducedMotion.removeEventListener("change", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      delete section.dataset.live;
    };
  }, [phaseCount]);

  return { sectionRef, phase };
}
