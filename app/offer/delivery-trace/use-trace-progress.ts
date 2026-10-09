"use client";

import { useEffect, useRef, useState } from "react";

// A step becomes active when it crosses a thin band just above mid-viewport.
const activationBand = "-40% 0px -50% 0px";

export function useTraceProgress() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !("IntersectionObserver" in window)) return;

    const steps = Array.from(
      container.querySelectorAll<HTMLElement>("[data-trace-step]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setActiveIndex(steps.indexOf(entry.target as HTMLElement));
        });
      },
      { rootMargin: activationBand },
    );

    steps.forEach((step) => observer.observe(step));
    // Inactive steps are only dimmed once tracking is known to work.
    container.dataset.tracking = "true";

    return () => {
      observer.disconnect();
      delete container.dataset.tracking;
    };
  }, []);

  return { containerRef, activeIndex };
}
