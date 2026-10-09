"use client";

import { diagnosticHeading } from "../offer-content";
import { LiveSystemCaption } from "./live-system-caption";
import { phases } from "./live-system-data";
import { LiveSystemScene } from "./live-system-scene";
import { useScrollPhase } from "./use-scroll-phase";
import styles from "./live-system.module.css";

const dayPhases = phases.slice(1);

export function LiveSystem() {
  const { sectionRef, phase } = useScrollPhase(phases.length);

  return (
    <section className={styles.liveSystem} aria-labelledby="live-system-title">
      <div className={styles.intro}>
        <p className={styles.label}>{diagnosticHeading.label}</p>
        <h2 id="live-system-title">
          {diagnosticHeading.title}
          <span>{` ${diagnosticHeading.accent}`}</span>
        </h2>
      </div>

      <div className={styles.track} ref={sectionRef}>
        <div className={styles.stage}>
          <div className={styles.sceneFrame}>
            <LiveSystemScene phase={phase} camera={phases[phase].camera} />
          </div>
          <LiveSystemCaption phases={phases} activePhase={phase} />
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
