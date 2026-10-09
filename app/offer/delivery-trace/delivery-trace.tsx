"use client";

import type { CSSProperties } from "react";
import { BookingLink } from "../../booking-link";
import { TraceRail } from "./trace-rail";
import { TraceStepCard } from "./trace-step-card";
import { traceSteps } from "./trace-steps";
import { useTraceProgress } from "./use-trace-progress";
import styles from "./delivery-trace.module.css";

export function DeliveryTrace() {
  const { containerRef, activeIndex } = useTraceProgress();
  // Drives the rail fill and packet position, from 0 (J1) to 1 (J5).
  const progressStyle = {
    "--trace-progress": activeIndex / (traceSteps.length - 1),
  } as CSSProperties;

  return (
    <section
      id="diagnostic"
      className={`offer-band ${styles.trace}`}
      aria-labelledby="delivery-trace-title"
    >
      <div className="offer-section-intro">
        <p className="offer-section-label">05 / Le diagnostic</p>
        <h2 id="delivery-trace-title">
          Une analyse progressive de la chaîne de delivery,
          <span> du cadrage à la restitution.</span>
        </h2>
      </div>

      <div className={styles.layout} ref={containerRef} style={progressStyle}>
        <TraceRail steps={traceSteps} activeIndex={activeIndex} />

        <div className={styles.steps}>
          {traceSteps.map((step, index) => (
            <TraceStepCard
              key={step.day}
              step={step}
              isActive={index === activeIndex}
            />
          ))}
          <BookingLink
            className={styles.cta}
            placement="offer-trace"
            label="Planifier un diagnostic"
          >
            Planifier un diagnostic
            <span aria-hidden="true">→</span>
          </BookingLink>
        </div>
      </div>
    </section>
  );
}
