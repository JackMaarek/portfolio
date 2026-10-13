import { architecture, botDomain, botPackages, botRings } from "./k8s-platform-content";
import styles from "./bot-ddd-diagram.module.css";

// platform-bot's packages on concentric rings, every dependency pointing to
// the domain at the centre. Colours follow the surface through currentColor
// and the panel's --diagram-* properties.
const c = 260;

const polar = (radius: number, angle: number): [number, number] => [
  c + radius * Math.cos((angle * Math.PI) / 180),
  c + radius * Math.sin((angle * Math.PI) / 180),
];

export function BotDddDiagram() {
  const [ax, ay] = polar(246, 240);
  const [bx, by] = polar(78, 240);

  return (
    <figure className={styles.figure}>
      <svg className={styles.svg} viewBox="0 0 520 520" role="img" aria-label={architecture.bot.label}>
        <defs>
          <marker id="ddd-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path className={styles.arrowHead} d="M0 0 L8 4 L0 8 z" />
          </marker>
        </defs>
        {botRings.map((ring, index) => {
          const domain = index === botRings.length - 1;
          return (
            <g key={ring.label} data-ring={index}>
              <circle className={styles.ring} cx={c} cy={c} r={ring.radius} />
              {/* The domain's label sits lower to clear its types. */}
              <text className={styles.ringLabel} data-domain={domain} x={c} y={c - ring.radius + (domain ? 24 : 16)}>
                {ring.label}
              </text>
            </g>
          );
        })}
        <g className={styles.core}>
          <text className={styles.coreName} x={c} y={c - 22}>{botDomain.name}</text>
          {botDomain.types.map((type, index) => (
            <text key={type} className={styles.coreType} x={c} y={c - 2 + index * 16}>{type}</text>
          ))}
        </g>
        {botPackages.map((item) => {
          const [x, y] = polar(item.radius, item.angle);
          const width = item.name.length * 6.5 + 16;
          return (
            <g key={item.name} className={styles.chip} data-layer={item.layer}>
              <rect x={(x - width / 2).toFixed(1)} y={(y - 11).toFixed(1)} width={width.toFixed(1)} height="22" rx="11" />
              <text x={x.toFixed(1)} y={(y + 3.6).toFixed(1)}>{item.name}</text>
            </g>
          );
        })}
        <path className={styles.dependency} d={`M${ax} ${ay} L ${bx} ${by}`} markerEnd="url(#ddd-arrow)" />
      </svg>
      <figcaption className={styles.caption}>{architecture.bot.caption}</figcaption>
    </figure>
  );
}
