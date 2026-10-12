import type { CSSProperties } from "react";
import { litAt, nodeArrival, nodeIssues, routePath, routeSegments, scene, systemNodes } from "./live-system-data";
import { dayTags, feedbackLoop } from "./live-system-paths";
import { SceneHypotheses } from "./scene-hypotheses";
import styles from "./live-system-scene.module.css";

type LiveSystemSceneProps = {
  phase: number;
  lead: boolean;
};

// Phase 0 shows an unknown system full of candidate paths; each day then
// traces one section of the real route until the hero topology is restored.
// In the lead state, behind the hero, the restored route is drawn without
// findings, feedback loop or packet, exactly like the hero topology.
export function LiveSystemScene({ phase, lead }: LiveSystemSceneProps) {
  const isTraced = (label: string) => phase >= litAt(label);
  const isRestored = phase === 5 && !lead;
  // A badge follows the active caption: all four blind spots are open in
  // section 02, then each one only shows as a finding on the day that
  // reports it in its "Constats".
  const badgeState = (label: string) => {
    if (phase === 0) return "open";
    return litAt(label) === phase ? "finding" : "hidden";
  };
  const currentTag = lead ? undefined : dayTags.find((tag) => tag.day === `J${phase}`);

  return (
    <svg
      className={styles.scene}
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      data-labelled={phase >= 1}
      data-lead={lead}
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      <defs>
        <filter id="live-system-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <SceneHypotheses phase={phase} />

      {routeSegments.map(({ from, to, delay, duration }) => (
        <g key={`${from.label}-${to.label}`}>
          <line className={styles.candidate} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
          <line
            className={styles.traced}
            data-traced={isTraced(from.label) && isTraced(to.label)}
            style={{ "--trace-delay": `${delay}ms`, "--trace-duration": `${duration}ms` } as CSSProperties}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            pathLength={1}
          />
        </g>
      ))}

      <path className={styles.loop} data-traced={phase >= 4} d={feedbackLoop} pathLength={1} />

      {systemNodes.map((node) => (
        <g
          key={node.label}
          className={styles.node}
          data-traced={isTraced(node.label)}
          style={{ "--arrival": `${nodeArrival[node.label] ?? 0}ms` } as CSSProperties}
          transform={`translate(${node.x} ${node.y})`}
        >
          <circle className={styles.halo} r="10" />
          <circle className={styles.ring} r="6" data-collide="node" />
          <circle className={styles.core} r="2.5" />
          <g className={styles.label} transform={`translate(${node.dx} ${node.dy})`}>
            <g className={styles.labelBody} data-side={node.dx < 0 ? "left" : "right"}>
              <rect x="0" y="-11" width={node.width} height="21" rx="2" data-collide="label" />
              <text x="7" y="3">{node.label}</text>
            </g>
          </g>
          {node.label in nodeIssues && (
            <g
              className={styles.badge}
              data-state={badgeState(node.label)}
              transform="translate(8 -9)"
            >
              <circle r="5.5" data-collide="badge" />
              <text y="2.7">!</text>
            </g>
          )}
        </g>
      ))}

      {currentTag && (
        <text
          key={currentTag.day}
          className={styles.dayTag}
          x={currentTag.x}
          y={currentTag.y}
          data-collide="day"
        >
          {currentTag.text}
        </text>
      )}

      {isRestored && (
        <g className={styles.packet}>
          <circle r="2.5" />
          <animateMotion dur="3.6s" repeatCount="indefinite" path={routePath} />
        </g>
      )}
    </svg>
  );
}
