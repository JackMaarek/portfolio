"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { experiences, parcours, results } from "../home-content";
import styles from "./career-column.module.css";

// Missions in chronological order, around an amber column. On wide screens
// the section is pinned and the scroll turns the column: the current
// mission comes to the front as a dossier sheet and its achievements leave
// it as separate leaves. Elsewhere the missions follow each other in the
// page. Pure CSS 3D: the scroll only updates --p on the section.
const missions = [...experiences].reverse();
const year = (period: string) => period.slice(0, 4);
// Mirrors the media query of the column layout in career-column.module.css.
const columnQuery = "(min-width: 1000px) and (min-height: 620px)";

export function CareerColumn({ label }: { label: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<HTMLLIElement[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const column = window.matchMedia(columnQuery);
    let frame = 0;
    let near = false;
    let current = -1;

    const update = () => {
      frame = 0;
      let index = 0;
      if (column.matches) {
        const rect = root.getBoundingClientRect();
        const travel = Math.max(rect.height - window.innerHeight, 1);
        const progress = Math.min(Math.max(-rect.top / travel, 0), 1) * (missions.length - 1);
        root.style.setProperty("--p", progress.toFixed(4));
        index = Math.round(progress);
      } else {
        // In the page flow the current mission is the last one whose card
        // has reached the upper part of the viewport.
        const line = window.innerHeight * 0.45;
        cardRefs.current.forEach((card, position) => {
          if (card.getBoundingClientRect().top < line) index = position;
        });
      }
      if (index !== current) {
        current = index;
        setActive(index);
      }
    };
    // Scroll far from the parcours reads no layout.
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
    column.addEventListener("change", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      column.removeEventListener("change", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (index: number) => {
    const root = rootRef.current;
    const card = cardRefs.current[index];
    if (!root || !card) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = window.matchMedia(columnQuery).matches
      ? root.getBoundingClientRect().top +
        window.scrollY +
        (index / (missions.length - 1)) * (root.offsetHeight - window.innerHeight)
      : card.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section
      ref={rootRef}
      id="experience"
      className={styles.parcours}
      aria-labelledby="parcours-title"
      style={{ "--count": missions.length } as CSSProperties}
    >
      <div className={styles.stage}>
        <div className={styles.head}>
          <p className="section-label">{label}</p>
          <h2 id="parcours-title">
            {parcours.title}
            <span>{` ${parcours.accent}`}</span>
          </h2>
        </div>

        <nav className={styles.years} aria-label="Missions">
          <p aria-hidden="true">Missions</p>
          <ol>
            {missions.map((mission, index) => (
              <li key={mission.company}>
                <button
                  type="button"
                  aria-current={active === index ? "step" : undefined}
                  onClick={() => goTo(index)}
                >
                  <strong>{year(mission.period)}</strong>
                  <span>{mission.company}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.spine} aria-hidden="true" />

        <ol className={styles.column}>
          {missions.map((mission, index) => {
            // The measured results come from the Padok missions.
            const figures = mission.company === "Padok" ? results : [];
            return (
              <li
                key={mission.company}
                ref={(element) => {
                  if (element) cardRefs.current[index] = element;
                }}
                className={styles.card}
                data-front={active === index}
                style={{ "--i": index } as CSSProperties}
              >
                <article className={styles.face} aria-labelledby={`mission-${index}`}>
                  <p className={styles.year} aria-hidden="true">
                    {year(mission.period)}
                  </p>
                  <h3 id={`mission-${index}`}>{mission.company}</h3>
                  <p className={styles.role}>
                    {mission.period} · {mission.role} · {mission.sector}
                  </p>
                  {/* Collapsed on the sheets behind, still read by assistive tech. */}
                  <div className={styles.detail}>
                    <div>
                      <p className={styles.summary}>{mission.summary}</p>
                      {figures.length > 0 && (
                        <dl className={styles.figures}>
                          {figures.map((figure) => (
                            <div key={figure.figure}>
                              <dt>{figure.figure}</dt>
                              <dd>{figure.body}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      <p className={styles.stackLabel} id={`mission-${index}-tech`}>
                        Stack mobilisée
                      </p>
                      <ul className={styles.chips} aria-labelledby={`mission-${index}-tech`}>
                        {mission.tech.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
                <ol className={styles.leaves} aria-label={`Réalisations · ${mission.company}`}>
                  {mission.points.map((point, position) => (
                    <li key={point}>
                      <span aria-hidden="true">{String(position + 1).padStart(2, "0")}</span>
                      {point}
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
