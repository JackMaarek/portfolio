"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { project } from "../home-content";
import styles from "./platform-breakdown.module.css";

// k8s-platform as an exploded view: its layers separate as the section
// scrolls by, each one named in turn, then close back on the assembled
// platform. In the flow the stack docks at the top of the screen and the
// callouts scroll under it, each lighting its layer as it passes. Pure CSS
// 3D: the scroll only updates custom properties on the section.
const layers = project.layers;
// Mirrors the media query of the pinned layout in platform-breakdown.module.css.
const pinnedQuery = "(min-width: 1000px) and (min-height: 620px)";

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

export function PlatformBreakdown() {
  const rootRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const calloutsRef = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    const root = rootRef.current;
    const copy = copyRef.current;
    const dock = dockRef.current;
    const callouts = calloutsRef.current;
    if (!root || !copy || !dock || !callouts) return;
    const pinned = window.matchMedia(pinnedQuery);
    let frame = 0;
    let near = false;
    let shown = -2;

    const update = () => {
      frame = 0;
      let explode: number;
      let next = -1;
      if (pinned.matches) {
        // Pinned: progress through the pinned length.
        const rect = root.getBoundingClientRect();
        const progress = Math.min(Math.max(-rect.top / Math.max(rect.height - window.innerHeight, 1), 0), 1);
        explode = smoothstep(0, 0.18, progress) * (1 - smoothstep(0.86, 1, progress));
        if (explode > 0.5) {
          next = Math.min(Math.floor(((progress - 0.18) / 0.68) * layers.length), layers.length - 1);
        }
      } else {
        // In the flow: the rail beside the copy fills down to the reading
        // line; the stack opens as the callouts reach the dock's bottom
        // edge, and the current one is the first still readable below it.
        const line = window.innerHeight * 0.45;
        const fill = Math.max(line - copy.getBoundingClientRect().top, 0);
        root.style.setProperty("--fill", `${fill.toFixed(1)}px`);
        // The rail ends at the dock (88px above the copy, 24px below it).
        root.style.setProperty("--dock-lit", fill + 88 >= copy.offsetHeight + 112 ? "1" : "0");
        const edge = dock.getBoundingClientRect().bottom;
        const list = callouts.getBoundingClientRect();
        explode = smoothstep(-0.04, 0.12, (edge - list.top) / list.height);
        if (explode > 0.5) {
          const items = Array.from(callouts.children);
          const below = items.findIndex((item) => item.getBoundingClientRect().top > edge - 20);
          next = below === -1 ? items.length - 1 : below;
        }
      }
      root.style.setProperty("--explode", explode.toFixed(4));
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
        <div ref={copyRef} className={styles.copy}>
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
            <Link className={styles.primary} href={project.page}>
              Voir le projet <span aria-hidden="true">→</span>
            </Link>
            <a
              className={styles.secondary}
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

        <div className={styles.view}>
          {/* Docked at the top of the screen in the flow. */}
          <div ref={dockRef} className={styles.dock} aria-hidden="true">
            {/* The parcours column, arriving as the axis the layers separate along. */}
            <span className={styles.axis} />
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
                  {/* One block per component; EKS shows its worker nodes. */}
                  {Array.from({ length: index === 1 ? 6 : layer.components.length }, (_, cell) => (
                    <i key={cell} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Callouts: each one follows its plate as the layers separate. */}
          <ol ref={calloutsRef} className={styles.callouts} aria-label={`Couches de ${project.name}`}>
            {[...layers, project.bot].map((layer, index) => (
              <li
                key={layer.name}
                data-current={current === index}
                data-bot={index === layers.length}
                style={{ "--i": index } as CSSProperties}
              >
                <b aria-hidden="true">{index === layers.length ? "CLI" : String(index + 1).padStart(2, "0")}</b>
                <div>
                  <strong>{layer.name}</strong>
                  <ul aria-label="Composants">
                    {layer.components.map((component) => (
                      <li key={component}>{component}</li>
                    ))}
                  </ul>
                  {"detail" in layer && layer.detail && <p>{layer.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
