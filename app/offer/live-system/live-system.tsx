"use client";

import type { ReactNode } from "react";
import { LiveSystemCaption } from "./live-system-caption";
import { phases } from "./live-system-data";
import { LiveSystemScene } from "./live-system-scene";
import { useScrollPhase } from "./use-scroll-phase";
import styles from "./live-system.module.css";

const dayPhases = phases.slice(1);
const restoredPhase = phases.length - 1;
const phaseWeights = phases.map((phase) => phase.weight);

type LiveSystemProps = {
  hero: ReactNode;
};

// The hero scrolls over the pinned scene, which starts in the hero state
// (the whole route traced). Once the hero is gone the route switches off,
// the blind spots open (section 02) and each diagnostic day traces it back.
export function LiveSystem({ hero }: LiveSystemProps) {
  const { sectionRef, leadRef, phase, inLead, scrollToPhase } = useScrollPhase(phaseWeights);

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
          <nav
            className={styles.progress}
            aria-label="Étapes du diagnostic"
            // Tabbing past the hero brings the scene in at section 02.
            onFocus={inLead ? () => scrollToPhase(0) : undefined}
          >
            <a className={styles.skip} href="#formats">
              Passer aux formats
              <span aria-hidden="true"> →</span>
            </a>
            <ol>
              {dayPhases.map((dayPhase, index) => (
                <li key={dayPhase.key} data-reached={phase >= index + 1}>
                  <button
                    type="button"
                    aria-label={`${dayPhase.key} · ${dayPhase.title}`}
                    aria-current={phase === index + 1 ? "step" : undefined}
                    onClick={() => scrollToPhase(index + 1)}
                  >
                    {dayPhase.key}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          {/* After the day navigation in the DOM so keyboard users meet the
              skip link and J1–J5 before the J5 booking link. */}
          <div className={styles.copy}>
            <LiveSystemCaption phases={phases} activePhase={phase} onFocusPhase={scrollToPhase} />
          </div>
        </section>
      </div>
      <div className={styles.exit} aria-hidden="true" />
    </div>
  );
}
