import type { TraceStep } from "./trace-steps";
import styles from "./trace-rail.module.css";

type TraceRailProps = {
  steps: TraceStep[];
  activeIndex: number;
};

function nodeState(index: number, activeIndex: number) {
  if (index < activeIndex) return "done";
  return index === activeIndex ? "current" : "next";
}

export function TraceRail({ steps, activeIndex }: TraceRailProps) {
  return (
    <nav className={styles.rail} aria-label="Étapes du diagnostic">
      <div className={styles.railInner}>
        <span className={styles.track} aria-hidden="true">
          <span className={styles.fill} />
          <span className={styles.packet} />
        </span>
        <ol className={styles.nodes}>
          {steps.map((step, index) => (
            <li key={step.day} data-state={nodeState(index, activeIndex)}>
              <a
                href={`#${step.anchor}`}
                aria-current={index === activeIndex ? "step" : undefined}
              >
                <span className={styles.node} aria-hidden="true" />
                <span className={styles.nodeDay}>{step.day}</span>
                <span className={styles.nodeTitle}>{step.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
