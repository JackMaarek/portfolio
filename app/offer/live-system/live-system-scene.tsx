import type { CSSProperties } from "react";
import {
  healthyAt,
  meshLinks,
  meshPoints,
  routePath,
  routeSegments,
  scene,
  systemAlerts,
  systemNodes,
  type Phase,
} from "./live-system-data";
import styles from "./live-system-scene.module.css";

type LiveSystemSceneProps = {
  phase: number;
  camera: Phase["camera"];
};

export function LiveSystemScene({ phase, camera }: LiveSystemSceneProps) {
  const isHealthy = phase === 5;
  const cameraStyle = {
    transform: `translate(${scene.width / 2 - camera.scale * camera.x}px, ${
      scene.height / 2 - camera.scale * camera.y
    }px) scale(${camera.scale})`,
  } as CSSProperties;

  return (
    <svg
      className={styles.scene}
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      data-mapped={phase >= 1}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="live-packet-glow">
          <stop offset="0%" stopColor="currentColor" stopOpacity=".7" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className={styles.camera} style={cameraStyle}>
        <g className={styles.mesh}>
          {meshLinks.map(([x1, y1, x2, y2]) => (
            <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} />
          ))}
          {meshPoints.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />
          ))}
        </g>

        {routeSegments.map((segment) => (
          <path
            key={segment.key}
            className={styles.route}
            d={`${segment.start} ${segment.curve}`}
            data-state={phase >= segment.healthyAt ? "ok" : "alert"}
          />
        ))}

        {systemNodes.map((node) => (
          <g
            key={node.id}
            className={styles.node}
            data-state={phase >= healthyAt(node.id) ? "ok" : "alert"}
            transform={`translate(${node.x} ${node.y})`}
          >
            <circle className={styles.halo} r="22" />
            <circle className={styles.ring} r="12" />
            <circle className={styles.core} r="4.5" />
            <text className={styles.nodeLabel} x="24" y="-20">
              {node.label}
            </text>
          </g>
        ))}

        {systemAlerts.map((alert) => {
          const node = systemNodes.find((candidate) => candidate.id === alert.node)!;
          return (
            <g
              key={alert.issue}
              className={styles.alert}
              data-state={phase >= alert.resolvedAt ? "resolved" : "open"}
              transform={`translate(${node.x + alert.dx} ${node.y + alert.dy})`}
            >
              <rect height="24" rx="12" width={alert.issue.length * 6.6 + 34} />
              <text x="12" y="16">
                {phase >= alert.resolvedAt ? "✓" : "!"} {alert.issue}
              </text>
            </g>
          );
        })}

        <g className={styles.packet} data-variant={isHealthy ? "steady" : "stalled"}>
          <circle r="16" fill="url(#live-packet-glow)" />
          <circle r="5" />
          {isHealthy ? (
            <animateMotion dur="3.2s" repeatCount="indefinite" path={routePath} />
          ) : (
            <animateMotion
              dur="5s"
              repeatCount="indefinite"
              path={routePath}
              calcMode="linear"
              keyPoints="0;.22;.22;.48;.44;.48;.72;.72;0"
              keyTimes="0;.18;.34;.5;.56;.62;.8;.94;1"
            />
          )}
        </g>
      </g>
    </svg>
  );
}
