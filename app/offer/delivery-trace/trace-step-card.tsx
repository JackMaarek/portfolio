import type { TraceStep } from "./trace-steps";
import styles from "./trace-step-card.module.css";

type TraceStepCardProps = {
  step: TraceStep;
  isActive: boolean;
};

export function TraceStepCard({ step, isActive }: TraceStepCardProps) {
  return (
    <article
      className={styles.card}
      id={step.anchor}
      data-trace-step
      data-active={isActive}
    >
      <span className={styles.cardDay}>{step.day}</span>
      <h3>{step.title}</h3>
      <p>{step.body}</p>

      {step.issues.length > 0 && (
        <div className={styles.cardGroup}>
          <p className={styles.cardLabel}>Ce qui vous ralentit</p>
          <ul className={styles.issueList}>
            {step.issues.map((issue) => (
              <li key={issue.title}>{issue.title}</li>
            ))}
          </ul>
        </div>
      )}

      {step.outputs.length > 0 && (
        <div className={styles.cardGroup}>
          <p className={styles.cardLabel}>Ce que vous obtenez</p>
          <ul className={styles.outputList}>
            {step.outputs.map((output) => (
              <li key={output.title}>
                <strong>{output.title}</strong> {output.body}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
