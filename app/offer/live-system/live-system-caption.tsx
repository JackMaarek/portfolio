import { BookingLink } from "../../booking-link";
import type { Phase } from "./live-system-data";
import styles from "./live-system-caption.module.css";

type LiveSystemCaptionProps = {
  phases: Phase[];
  activePhase: number;
};

export function LiveSystemCaption({ phases, activePhase }: LiveSystemCaptionProps) {
  const lastPhase = phases.length - 1;

  return (
    <div className={styles.captions}>
      {phases.map((phase, index) => {
        const isIncident = index === 0;
        return (
          <article
            key={phase.key}
            className={styles.caption}
            data-active={index === activePhase}
            data-tone={isIncident ? "alert" : "diagnosed"}
          >
            <p className={styles.kicker}>{phase.kicker}</p>
            <h3>{phase.title}</h3>
            <p className={styles.body}>{phase.body}</p>

            {phase.issues.length > 0 && (
              <ul className={styles.issues}>
                {phase.issues.map((issue) => (
                  <li key={issue}>
                    <span aria-hidden="true">{isIncident ? "!" : "✓"}</span> {issue}
                  </li>
                ))}
              </ul>
            )}

            {phase.outputs.length > 0 && (
              <div className={styles.outputs}>
                <p className={styles.outputsLabel}>Ce que vous obtenez</p>
                <ul>
                  {phase.outputs.map((output) => (
                    <li key={output.title}>
                      <strong>{output.title}</strong>
                      {phase.outputs.length === 1 && <> {output.body}</>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {index === lastPhase && (
              <BookingLink
                className={styles.cta}
                placement="offer-trace"
                label="Planifier un diagnostic"
              >
                Planifier un diagnostic
                <span aria-hidden="true">→</span>
              </BookingLink>
            )}
          </article>
        );
      })}
    </div>
  );
}
