"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Maps the scroll position inside a tall pinned section to a phase index.
// The lead block (the hero) scrolls over the pinned stage first: while it is
// on screen the scene stays in its lead state, and the phases only start
// counting once it has scrolled past. Each phase takes a share of the
// remaining scroll proportional to its weight.
// One layout read per frame; React only re-renders when the state changes.
export function useScrollPhase(weights: number[]) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [inLead, setInLead] = useState(true);
  const phaseCount = weights.length;

  // Progress (0..1) at which each phase starts.
  const starts = useMemo(() => {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    return weights.map(
      (_, index) => weights.slice(0, index).reduce((sum, weight) => sum + weight, 0) / total,
    );
  }, [weights]);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return null;
    const lead = leadRef.current?.offsetHeight ?? 0;
    const bounds = section.getBoundingClientRect();
    const range = Math.max(bounds.height - lead - window.innerHeight, 1);
    return { lead, bounds, range };
  }, []);

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
      const metrics = measure();
      if (!metrics) return;
      const { lead, bounds, range } = metrics;
      section.style.setProperty("--lead-height", `${lead}px`);
      const scrolled = -bounds.top;
      const progress = Math.min(Math.max((scrolled - lead) / range, 0), 1);
      section.style.setProperty("--scene-progress", progress.toFixed(3));
      // Hand over once the hero has (almost) left the viewport, not before:
      // captions must never share the screen with the hero copy.
      setInLead(lead > 0 && scrolled < lead - window.innerHeight * 0.1);
      setPhase(starts.findLastIndex((start) => progress >= start));
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
  }, [phaseCount, starts, measure]);

  // Scrolls to just inside a phase, so its caption is the one shown.
  const scrollToPhase = useCallback(
    (index: number) => {
      const metrics = measure();
      if (!metrics || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const { lead, bounds, range } = metrics;
      const end = starts[index + 1] ?? 1;
      const inside = starts[index] + (end - starts[index]) * 0.15;
      window.scrollTo({ top: window.scrollY + bounds.top + lead + range * inside, behavior: "smooth" });
    },
    [measure, starts],
  );

  return { sectionRef, leadRef, phase, inLead, scrollToPhase };
}
