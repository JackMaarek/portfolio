"use client";

import { diagnosticHeading } from "../offer-content";
import { LiveSystemCaption } from "./live-system-caption";
import { phases } from "./live-system-data";
import { LiveSystemScene } from "./live-system-scene";
import { useScrollPhase } from "./use-scroll-phase";
import styles from "./live-system.module.css";

const dayPhases = phases.slice(1);

export function LiveSystem({ id }: { id?: string }) {
  const { sectionRef, phase } = useScrollPhase(phases.length);

  return (
    <section id={id} className={styles.liveSystem} aria-labelledby="live-system-title">
      <div className="hero-grid" aria-hidden="true" />
      <div className={styles.intro}>
        <p className="offer-section-label">{diagnosticHeading.label}</p>
        <h2 id="live-system-title">
          {diagnosticHeading.title}
          <span>{` ${diagnosticHeading.accent}`}</span>
        </h2>
      </div>

      <div className={styles.track} ref={sectionRef}>
        <div className={styles.stage}>
          <div className={styles.sceneFrame}>
            <LiveSystemScene phase={phase} />
          </div>
          <div className={styles.copy}>
            <LiveSystemCaption phases={phases} activePhase={phase} />
          </div>
          <ol className={styles.progress} aria-hidden="true">
            {dayPhases.map((dayPhase, index) => (
              <li key={dayPhase.key} data-reached={phase >= index + 1}>
                {dayPhase.key}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
