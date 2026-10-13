"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  type CodeSegment,
  type EnvName,
  envNames,
  environments,
  flow,
  resolvedKeys,
  syncWaves,
  templateCode,
  terminalLines,
} from "./k8s-platform-content";
import styles from "./commit-to-cluster-flow.module.css";

// The five stages from the template on main to the cluster. The resting
// state is complete (values resolved, modules synced); the sequence plays
// once when the flow scrolls into view, then on each environment change or
// replay, and never under reduced motion.
type Frame = {
  live: number;
  lines: number;
  resolved: number;
  runtime: boolean;
  synced: number;
  wave: string | null;
  playing: boolean;
};

const lineCount = terminalLines("dev").length;
const rest: Frame = {
  live: -1,
  lines: lineCount,
  resolved: resolvedKeys.length,
  runtime: true,
  synced: syncWaves.length,
  wave: null,
  playing: false,
};

// [delay in ms, frame changes], in the mockup's timing.
function timeline(): [number, Partial<Frame>][] {
  const steps: [number, Partial<Frame>][] = [
    [0, { live: 0, lines: 0, resolved: 0, runtime: false, synced: 0, wave: "", playing: true }],
  ];
  let t = 900;
  steps.push([t, { live: 1 }]);
  for (let i = 0; i < lineCount; i++) steps.push([t + 200 + i * 260, { lines: i + 1 }]);
  t += 200 + lineCount * 260 + 200;
  steps.push([t, { live: 2 }]);
  resolvedKeys.forEach((_, i) => steps.push([t + 300 + i * 280, { resolved: i + 1 }]));
  t += 1400;
  steps.push([t, { live: 3, runtime: true }]);
  syncWaves.forEach((wave, i) => steps.push([t + 400 + i * 260, { synced: i + 1, wave: wave.name }]));
  t += 400 + syncWaves.length * 260 + 300;
  steps.push([t, { live: 4, wave: null }]);
  steps.push([t + 1600, { live: -1, playing: false }]);
  return steps;
}

function Code({ lines }: { lines: CodeSegment[][] }) {
  return (
    <pre className={styles.code}>
      {lines.map((line, l) => (
        <Fragment key={l}>
          {line.map((segment, s) => (
            <span key={s} className={segment.kind ? styles[segment.kind] : undefined}>
              {segment.text}
            </span>
          ))}
          {l < lines.length - 1 && "\n"}
        </Fragment>
      ))}
    </pre>
  );
}

// Sets the step body's file and branch names as code.
const codeWords = new RegExp(`(${flow.codeWords.map((word) => word.replace(".", "\\.")).join("|")})`);
const withCode = (text: string) =>
  text.split(codeWords).map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));

function GitGraph({ env }: { env: EnvName }) {
  return (
    <svg className={styles.graph} viewBox="0 0 260 112" aria-hidden="true">
      <text className={styles.graphLabel} x="0" y="20">main</text>
      <line className={styles.lane} data-main="true" x1="56" y1="16" x2="256" y2="16" />
      <circle className={styles.mainDot} cx="96" cy="16" r="4.5" />
      {envNames.map((name, index) => {
        const y = 46 + index * 28;
        return (
          <g key={name} data-on={name === env}>
            <text className={styles.graphLabel} x="0" y={y + 4}>{name}</text>
            <line className={styles.lane} x1="56" y1={y} x2="256" y2={y} />
            <path className={styles.hydrate} d={`M96 16 C 130 16, 150 ${y}, 190 ${y}`} />
            <circle className={styles.dot} cx="190" cy={y} r="4.5" />
          </g>
        );
      })}
    </svg>
  );
}

export function CommitToClusterFlow() {
  const [env, setEnv] = useState<EnvName>("dev");
  const [frame, setFrame] = useState<Frame>(rest);
  const flowRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.length = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrame(rest);
      return;
    }
    for (const [delay, changes] of timeline()) {
      timers.current.push(window.setTimeout(() => setFrame((current) => ({ ...current, ...changes })), delay));
    }
  }, []);

  useEffect(() => {
    const element = flowRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        play();
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    const pending = timers.current;
    return () => {
      observer.disconnect();
      pending.forEach(clearTimeout);
    };
  }, [play]);

  const selectEnv = (name: EnvName) => {
    setEnv(name);
    play();
  };

  const current = environments[env];
  const lines = terminalLines(env);

  return (
    <section className={styles.section} aria-labelledby="flow-title">
      <div className={styles.head}>
        <div>
          <p className="section-label">{flow.label}</p>
          <h2 id="flow-title">{flow.title}</h2>
          <p className={styles.intro}>
            <code>main</code>
            {flow.intro.before}
            <code>__PLACEHOLDER__</code>
            {flow.intro.after}
          </p>
        </div>
        <div className={styles.controls}>
          <div className={styles.segmented} role="group" aria-label={flow.envLabel}>
            {envNames.map((name) => (
              <button key={name} type="button" aria-pressed={env === name} onClick={() => selectEnv(name)}>
                {name}
              </button>
            ))}
          </div>
          <button type="button" className={styles.replay} onClick={play}>
            <span aria-hidden="true">↻ </span>
            {flow.replay}
          </button>
        </div>
      </div>

      <div ref={flowRef} className={styles.flow} data-playing={frame.playing}>
        {flow.steps.map((step, index) => (
          <article key={step.number} className={styles.step} data-live={frame.live === index}>
            <div className={styles.stepHead}>
              <span className={styles.stepNumber}>{step.number}</span>
              <span className={styles.stepWho}>{step.who}</span>
            </div>
            <h3>{step.title ?? current.cluster}</h3>
            <p>{withCode(step.body)}</p>

            {index === 0 && <Code lines={templateCode} />}

            {index === 1 && (
              <pre className={`${styles.code} ${styles.terminal}`}>
                {lines.map((line, l) => (
                  <span key={l} className={styles.line} data-hidden={l >= frame.lines}>
                    {line.kind === "prompt" ? <span className={styles.prompt}>$</span> : <span className={styles.ok}>✓</span>}{" "}
                    {line.text}
                    {line.note && <span className={styles.comment}> {line.note}</span>}
                  </span>
                ))}
              </pre>
            )}

            {index === 2 && (
              <>
                <GitGraph env={env} />
                <pre className={styles.code}>
                  <span className={styles.comment}># branche {env}</span>
                  {resolvedKeys.map((entry, k) => {
                    const done = k < frame.resolved;
                    return (
                      <Fragment key={entry.token}>
                        {"\n"}
                        {entry.key}
                        <span key={done ? "value" : "token"} className={styles.resolved} data-flash={done && frame.playing}>
                          {done ? entry.value(env) : entry.token}
                        </span>
                      </Fragment>
                    );
                  })}
                </pre>
              </>
            )}

            {index === 3 && (
              <>
                <pre className={styles.code}>
                  {"name: '"}
                  <span className={styles.runtime}>{"prometheus-{{.env}}"}</span>
                  {"'\n"}
                  <span className={styles.comment}>→</span>{" "}
                  <span key={frame.runtime ? "value" : "pending"} className={styles.resolved} data-flash={frame.runtime && frame.playing}>
                    {frame.runtime ? `prometheus-${env}` : "…"}
                  </span>
                </pre>
                <ul className={styles.waves} aria-label="Modules synchronisés">
                  {syncWaves.map((wave, w) => (
                    <li key={wave.name} data-synced={w < frame.synced}>
                      <i aria-hidden="true" />
                      <b>{wave.name}</b>
                      <span>{wave.detail}</span>
                    </li>
                  ))}
                </ul>
                <p className={styles.waveNow} aria-live="polite">
                  {frame.wave === null ? (
                    <>
                      <b>{`${syncWaves.length}/${syncWaves.length}`}</b> modules synchronisés
                    </>
                  ) : (
                    frame.wave && (
                      <>
                        <b>{frame.wave}</b> synchronisé
                      </>
                    )
                  )}
                </p>
              </>
            )}

            {index === 4 && (
              <dl className={styles.cluster}>
                <dt>runtime</dt>
                <dd>{current.runtime}</dd>
                <dt>api</dt>
                <dd><code>{flow.maskedApi}</code></dd>
                <dt>branche</dt>
                <dd><code>origin/{env}</code></dd>
                <dt>kyverno</dt>
                <dd><span className={styles.pill} data-enforce={current.kyverno === "Enforce"}>{current.kyverno}</span></dd>
                <dt>compliance</dt>
                <dd><code>{current.compliance}</code></dd>
                <dt>mTLS</dt>
                <dd><code>STRICT</code></dd>
                <dt>infra</dt>
                <dd>{current.apply}</dd>
                <dt>état</dt>
                <dd><span className={styles.pill} data-healthy="true">Synced · Healthy</span></dd>
              </dl>
            )}
          </article>
        ))}
      </div>

      <div className={styles.syntax}>
        {flow.syntax.map((item) => (
          <div key={item.code} className={styles.syntaxItem}>
            <code className={styles[item.kind]}>{item.code}</code>
            <b>{item.title}</b>
            <span>
              {item.body.before}
              {item.body.code && <code>{item.body.code}</code>}
              {item.body.after}
            </span>
          </div>
        ))}
      </div>
      <ul className={styles.rules}>
        {flow.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </section>
  );
}
