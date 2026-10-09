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
          >
            <p className={styles.kicker}>{phase.kicker}</p>
            {isIncident ? (
              <h3>
                {phase.title}
                <span>{` ${phase.body}`}</span>
              </h3>
            ) : (
              <>
                <h3>{phase.title}</h3>
                <p className={styles.body}>{phase.body}</p>
              </>
            )}

            {phase.issues.length > 0 && (
              <ul className={styles.tags} data-tone={isIncident ? "open" : "resolved"}>
                {phase.issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}

            {phase.outputs.length > 0 && (
              <ul className={styles.outputs} aria-label="Ce que vous obtenez">
                {phase.outputs.map((output) => (
                  <li key={output.title}>
                    <strong>{output.title}</strong>
                    {phase.outputs.length === 1 && <span>{` ${output.body}`}</span>}
                  </li>
                ))}
              </ul>
            )}

            {index === lastPhase && (
              <BookingLink
                className={`offer-primary-link ${styles.cta}`}
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
