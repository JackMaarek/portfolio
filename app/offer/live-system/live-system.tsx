"use client";

import type { ReactNode } from "react";
import { LiveSystemCaption } from "./live-system-caption";
import { phases } from "./live-system-data";
import { LiveSystemScene } from "./live-system-scene";
import { useScrollPhase } from "./use-scroll-phase";
import styles from "./live-system.module.css";

const dayPhases = phases.slice(1);
const restoredPhase = phases.length - 1;

type LiveSystemProps = {
  hero: ReactNode;
};

// The hero scrolls over the pinned scene, which starts in the hero state
// (the whole route traced). Once the hero is gone the route switches off,
// the blind spots open (section 02) and each diagnostic day traces it back.
export function LiveSystem({ hero }: LiveSystemProps) {
  const { sectionRef, leadRef, phase, inLead } = useScrollPhase(phases.length);

  return (
    <div className={styles.liveSystem}>
      <div className="hero-grid" aria-hidden="true" />
      <div className={styles.track} ref={sectionRef}>
        <div className={styles.lead} ref={leadRef}>
          {hero}
          <span id="offer-content" className={styles.anchor} aria-hidden="true" />
        </div>

        <section className={styles.stage} data-lead={inLead} aria-label="Le diagnostic">
          <div className={styles.sceneFrame}>
            <LiveSystemScene phase={inLead ? restoredPhase : phase} lead={inLead} />
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
        </section>
      </div>
    </div>
  );
}
