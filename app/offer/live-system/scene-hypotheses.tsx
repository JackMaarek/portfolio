import { meshPoints } from "./live-system-data";
import { candidateLinks, deadEnds, wanderingPaths } from "./live-system-paths";
import styles from "./live-system-scene.module.css";

type SceneHypothesesProps = {
  phase: number;
};

// Candidate paths of the unknown system. They settle into the hero mesh as
// the diagnostic traces the real route; dead ends disappear.
export function SceneHypotheses({ phase }: SceneHypothesesProps) {
  return (
    <g>
      {candidateLinks.map(({ from, to, settleAt }) => (
        <line
          key={`${from.x}-${from.y}-${to.x}-${to.y}`}
          className={styles.candidate}
          data-settled={phase >= settleAt}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
        />
      ))}

      {deadEnds.map(({ from, to, removedAt }) => (
        <line
          key={`${from.x}-${from.y}-${to.x}-${to.y}`}
          className={styles.deadEnd}
          data-removed={phase >= removedAt}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
        />
      ))}

      {meshPoints.map(({ x, y }) => (
        <circle
          key={`${x}-${y}`}
          className={styles.meshPoint}
          data-settled={phase >= 3}
          cx={x}
          cy={y}
          r="4"
        />
      ))}

      {phase <= 1 &&
        wanderingPaths.map((path, index) => (
          <circle key={path} className={styles.wanderer} r="3.5" opacity="0">
            <animateMotion
              dur="4.2s"
              begin={`${index * 1.1}s`}
              repeatCount="indefinite"
              path={path}
            />
            <animate
              attributeName="opacity"
              values="0;.9;.9;0"
              keyTimes="0;.12;.78;1"
              dur="4.2s"
              begin={`${index * 1.1}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
    </g>
  );
}
