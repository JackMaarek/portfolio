"use client";

import { useEffect, useRef, useState } from "react";

// Maps the scroll position inside a tall pinned section to a phase index.
// The lead block (the hero) scrolls over the pinned stage first: while it is
// on screen the scene stays in its lead state, and the phases only start
// counting once it has scrolled past.
// One layout read per frame; React only re-renders when the state changes.
export function useScrollPhase(phaseCount: number) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [inLead, setInLead] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
        setInLead(false);
        setPhase(phaseCount - 1);
        return;
      }
      const lead = leadRef.current?.offsetHeight ?? 0;
      section.style.setProperty("--lead-height", `${lead}px`);
      const bounds = section.getBoundingClientRect();
      const scrolled = -bounds.top;
      const range = Math.max(bounds.height - lead - window.innerHeight, 1);
      const progress = Math.min(Math.max((scrolled - lead) / range, 0), 1);
      section.style.setProperty("--scene-progress", progress.toFixed(3));
      // Hand over once the hero has (almost) left the viewport, not before:
      // captions must never share the screen with the hero copy.
      setInLead(lead > 0 && scrolled < lead - window.innerHeight * 0.1);
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
      section.style.removeProperty("--lead-height");
    };
  }, [phaseCount]);

  return { sectionRef, leadRef, phase, inLead };
}
