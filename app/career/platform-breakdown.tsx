"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { project } from "../home-content";
import styles from "./platform-breakdown.module.css";

// k8s-platform as an exploded view: its layers separate as the section
// scrolls by, each one named in turn, then close back on the assembled
// platform. Pure CSS 3D: the scroll only updates --explode on the section.
const layers = project.layers;
// Mirrors the media query of the pinned layout in platform-breakdown.module.css.
const pinnedQuery = "(min-width: 1000px) and (min-height: 620px)";

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

export function PlatformBreakdown() {
  const rootRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pinned = window.matchMedia(pinnedQuery);
    let frame = 0;
    let near = false;
    let shown = -2;

    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const viewport = window.innerHeight;
      // Pinned: progress through the pinned length. In the flow: progress
      // of the section across the viewport.
      const progress = pinned.matches
        ? Math.min(Math.max(-rect.top / Math.max(rect.height - viewport, 1), 0), 1)
        : Math.min(Math.max((viewport * 0.8 - rect.top) / (rect.height + viewport * 0.2), 0), 1);
      const explode = smoothstep(0, 0.18, progress) * (1 - smoothstep(0.86, 1, progress));
      root.style.setProperty("--explode", explode.toFixed(4));
      const layer =
        explode > 0.5
          ? Math.min(Math.floor(((progress - 0.18) / 0.68) * layers.length), layers.length - 1)
          : -1;
      const next = Math.max(layer, -1);
      if (next !== shown) {
        shown = next;
        setCurrent(next);
      }
    };
    const onScroll = () => {
      if (near && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        onScroll();
      },
      { rootMargin: "25% 0px" },
    );
    observer.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    pinned.addEventListener("change", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      pinned.removeEventListener("change", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={rootRef} id="projects" className={styles.project} aria-labelledby="project-title">
      <div className={styles.stage}>
        <div className={styles.copy}>
          <p className="section-label">{project.label}</p>
          <p className={styles.kicker}>{project.kicker}</p>
          <h2 id="project-title">{project.name}</h2>
          <p className={styles.lead}>{project.lead}</p>
          {project.columns.map((column) => (
            <p className={styles.body} key={column}>
              {column}
            </p>
          ))}
          <div className={styles.actions}>
            <a
              className={styles.github}
              href={project.repository}
              target="_blank"
              rel="noreferrer"
              aria-label="Voir k8s-platform sur GitHub (nouvel onglet)"
            >
              Voir sur GitHub <span aria-hidden="true">↗</span>
            </a>
            <span>{project.cli}</span>
          </div>
        </div>

        <div className={styles.view} aria-hidden="true">
          <div className={styles.layers}>
            {layers.map((layer, index) => (
              <div
                key={layer.name}
                className={styles.plate}
                data-described={layer.described ?? false}
                data-current={current === index}
                style={{ "--i": index } as CSSProperties}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {/* Cluster nodes on EKS, components elsewhere. */}
                {Array.from({ length: index === 1 ? 8 : 4 }, (_, cell) => (
                  <i key={cell} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <ol className={styles.legend} aria-label={`Couches de ${project.name}`}>
          {layers
            .map((layer, index) => ({ layer, index }))
            .reverse()
            .map(({ layer, index }) => (
              <li key={layer.name} data-current={current === index}>
                <b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b>
                <span>
                  {layer.name}
                  <small>{layer.note}</small>
                </span>
              </li>
            ))}
          <li>
            <b aria-hidden="true">CLI</b>
            <span>
              {project.bot.name}
              <small>{project.bot.note}</small>
            </span>
          </li>
        </ol>
      </div>
    </section>
  );
}
