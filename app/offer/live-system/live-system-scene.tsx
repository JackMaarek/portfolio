import { litAt, nodeIssues, routePath, scene, systemNodes } from "./live-system-data";
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
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <SceneHypotheses phase={phase} />

      {systemNodes.slice(1).map((node, index) => {
        const previous = systemNodes[index];
        const traced = isTraced(previous.label) && isTraced(node.label);
        return (
          <g key={`${previous.label}-${node.label}`}>
            <line className={styles.candidate} x1={previous.x} y1={previous.y} x2={node.x} y2={node.y} />
            <line
              className={styles.traced}
              data-traced={traced}
              x1={previous.x}
              y1={previous.y}
              x2={node.x}
              y2={node.y}
              pathLength={1}
            />
          </g>
        );
      })}

      <path className={styles.loop} data-traced={phase >= 4} d={feedbackLoop} pathLength={1} />

      {systemNodes.map((node) => (
        <g
          key={node.label}
          className={styles.node}
          data-traced={isTraced(node.label)}
          transform={`translate(${node.x} ${node.y})`}
        >
          <circle className={styles.halo} r="18" />
          <circle className={styles.ring} r="12" data-collide="node" />
          <circle className={styles.core} r="6" />
          <g className={styles.label} transform={`translate(${node.dx} ${node.dy})`}>
            <rect x="0" y="-16" width={node.width} height="28" rx="3" data-collide="label" />
            <text x="10" y="3">{node.label}</text>
          </g>
          {node.label in nodeIssues && (
            <g
              className={styles.badge}
              data-state={isTraced(node.label) ? "finding" : "open"}
              transform="translate(13 -13)"
            >
              <circle r="8" data-collide="badge" />
              <text y="4">!</text>
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
          <circle r="4.5" />
          <animateMotion dur="3.6s" repeatCount="indefinite" path={routePath} />
        </g>
      )}
    </svg>
  );
}
