"use client";

import { useEffect } from "react";

const revealSelector = "[data-offer-reveal]";

export function OfferMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".offer-shell");
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelector),
    );

    if (!root || elements.length === 0) return;

    const show = (element: HTMLElement) => element.classList.add("is-visible");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(show);
      return;
    }

    const initialRevealLine = window.innerHeight * 0.72;
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top <= initialRevealLine) show(element);
    });
    root.classList.add("offer-motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    elements.forEach((element) => {
      if (!element.classList.contains("is-visible")) observer.observe(element);
    });

    return () => {
      observer.disconnect();
      root.classList.remove("offer-motion-ready");
    };
  }, []);

  return null;
}
