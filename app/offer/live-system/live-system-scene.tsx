import {
  litAt,
  meshLinks,
  meshPoints,
  nodeIssues,
  routePath,
  scene,
  systemNodes,
  type Phase,
} from "./live-system-data";
import styles from "./live-system-scene.module.css";

type LiveSystemSceneProps = {
  phase: number;
  current: Phase;
};

// The offer hero topology, switched off at first and relit day by day.
export function LiveSystemScene({ phase, current }: LiveSystemSceneProps) {
  const isLit = (label: string) => phase >= litAt(label);
  const inFocus = (label: string) =>
    current.focus.length === 0 || current.focus.includes(label);
  const isRestored = phase === 5;

  return (
    <svg
      className={styles.scene}
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      data-mapped={phase >= 1}
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

      <g className={styles.mesh}>
        {meshLinks.map(({ from, to }) => (
          <line
            key={`${from.x}-${from.y}-${to.x}-${to.y}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            pathLength={1}
          />
        ))}
        {meshPoints.map(({ x, y }) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4" />
        ))}
      </g>

      {systemNodes.slice(1).map((node, index) => {
        const previous = systemNodes[index];
        return (
          <line
            key={`${previous.label}-${node.label}`}
            className={styles.segment}
            x1={previous.x}
            y1={previous.y}
            x2={node.x}
            y2={node.y}
            data-lit={isLit(previous.label) && isLit(node.label)}
            data-focus={inFocus(previous.label) || inFocus(node.label)}
          />
        );
      })}

      {systemNodes.map((node) => (
        <g
          key={node.label}
          className={styles.node}
          data-lit={isLit(node.label)}
          data-focus={inFocus(node.label)}
          transform={`translate(${node.x} ${node.y})`}
        >
          <circle className={styles.halo} r="18" />
          <circle className={styles.ring} r="12" />
          <circle className={styles.core} r="6" />
          <g className={styles.label} transform={`translate(${node.dx} ${node.dy})`}>
            <rect x="0" y="-16" width={node.width} height="28" rx="3" />
            <text x="10" y="3">{node.label}</text>
          </g>
          {node.label in nodeIssues && !isLit(node.label) && (
            <g className={styles.badge} transform="translate(13 -13)">
              <circle r="8" />
              <text y="4">!</text>
            </g>
          )}
        </g>
      ))}

      <g className={styles.packet} data-restored={isRestored}>
        <circle r="4.5" />
        {isRestored ? (
          <animateMotion key="steady" dur="3.6s" repeatCount="indefinite" path={routePath} />
        ) : (
          <animateMotion
            key="stalled"
            dur="6s"
            repeatCount="indefinite"
            path={routePath}
            calcMode="linear"
            keyPoints="0;.2;.2;.42;.42;0"
            keyTimes="0;.2;.45;.62;.9;1"
          />
        )}
      </g>
    </svg>
  );
}
