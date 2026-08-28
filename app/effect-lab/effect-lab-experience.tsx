"use client";

import Link from "next/link";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import styles from "./effect-lab.module.css";

const route =
  "M 90 96 C 150 96 160 190 220 190 C 280 190 300 252 360 252 C 420 252 448 188 520 188 C 570 188 565 320 610 320 C 640 320 645 382 675 382";

const nodes = [
  { label: "Code", x: 90, y: 96, width: 68, labelX: 22, labelY: -34 },
  { label: "CI", x: 220, y: 190, width: 42, labelX: -62, labelY: -16 },
  { label: "Registry", x: 360, y: 252, width: 98, labelX: -46, labelY: 52 },
  { label: "ArgoCD", x: 520, y: 188, width: 88, labelX: 26, labelY: -24 },
  { label: "EKS", x: 610, y: 320, width: 52, labelX: -82, labelY: 10 },
  { label: "Metrics", x: 675, y: 382, width: 86, labelX: -108, labelY: 54 },
];

const steps = [
  {
    index: "01",
    node: "Code",
    title: "Le changement entre dans le système.",
    body: "Le commit devient un événement traçable. La chaîne commence avec une intention claire, un auteur et un contexte.",
    signal: "Source identifiée · contexte conservé",
  },
  {
    index: "02",
    node: "CI",
    title: "Le pipeline qualifie le risque.",
    body: "Tests, contrôles et packaging transforment le changement en décision de promotion — ou en arrêt explicite.",
    signal: "Contrôles passés · risque mesuré",
  },
  {
    index: "03",
    node: "Registry",
    title: "L’artefact devient immuable.",
    body: "Une version identifiable relie le code, l’image produite et la preuve qui autorise son déploiement.",
    signal: "Artefact signé · version verrouillée",
  },
  {
    index: "04",
    node: "ArgoCD",
    title: "L’intention rejoint le cluster.",
    body: "GitOps rend la promotion visible : l’état désiré, l’écart constaté et la réconciliation partagent la même histoire.",
    signal: "État désiré · dérive observable",
  },
  {
    index: "05",
    node: "EKS",
    title: "La production expose son état réel.",
    body: "Le déploiement n’est plus une fin de pipeline. Santé, disponibilité et rollback restent liés à la version livrée.",
    signal: "Rollout sain · retour arrière prêt",
  },
  {
    index: "06",
    node: "Metrics",
    title: "Le signal revient à l’équipe.",
    body: "Métriques, logs et alertes referment la boucle : l’équipe sait ce qui a changé, ce qui dérive et où agir.",
    signal: "Boucle fermée · décision possible",
  },
];

export function EffectLabExperience() {
  const sceneRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const packetRef = useRef<SVGCircleElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const path = routeRef.current;
    const packet = packetRef.current;
    const status = statusRef.current;

    if (!scene || !path || !packet || !status) return;

    const nodeElements = Array.from(
      scene.querySelectorAll<SVGGElement>("[data-trace-node]"),
    );
    const stepElements = Array.from(
      scene.querySelectorAll<HTMLElement>("[data-trace-step]"),
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pathLength = path.getTotalLength();
    let animationFrame = 0;
    let lastActiveIndex = -1;

    path.style.strokeDasharray = `${pathLength}`;

    const setActiveIndex = (activeIndex: number) => {
      if (activeIndex === lastActiveIndex) return;
      lastActiveIndex = activeIndex;
      nodeElements.forEach((node, index) => {
        node.dataset.active = String(index <= activeIndex);
        node.dataset.current = String(index === activeIndex);
      });
      stepElements.forEach((step, index) => {
        step.dataset.active = String(index === activeIndex);
      });
      status.textContent = `TRACE ${String(activeIndex + 1).padStart(2, "0")} / 06`;
    };

    const render = () => {
      animationFrame = 0;
      const bounds = scene.getBoundingClientRect();
      const scrollRange = Math.max(scene.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(-bounds.top / scrollRange, 0), 1);
      const activationLine = window.innerHeight * (window.innerWidth <= 980 ? .72 : .55);
      const activeIndex = stepElements.reduce(
        (closestIndex, step, index) => {
          const closestBounds = stepElements[closestIndex].getBoundingClientRect();
          const stepBounds = step.getBoundingClientRect();
          const closestDistance = Math.abs(
            closestBounds.top + closestBounds.height / 2 - activationLine,
          );
          const stepDistance = Math.abs(
            stepBounds.top + stepBounds.height / 2 - activationLine,
          );
          return stepDistance < closestDistance ? index : closestIndex;
        },
        0,
      );
      const point = path.getPointAtLength(pathLength * progress);

      scene.style.setProperty("--trace-progress", progress.toFixed(4));
      path.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
      packet.setAttribute("cx", point.x.toFixed(2));
      packet.setAttribute("cy", point.y.toFixed(2));
      setActiveIndex(activeIndex);
    };

    if (reducedMotion) {
      scene.dataset.reducedMotion = "true";
      scene.style.setProperty("--trace-progress", "1");
      path.style.strokeDashoffset = "0";
      nodeElements.forEach((node) => {
        node.dataset.active = "true";
        node.dataset.current = "false";
      });
      stepElements.forEach((step) => {
        step.dataset.active = "true";
      });
      status.textContent = "TRACE STATIQUE";
      return;
    }

    const requestRender = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(render);
    };

    scene.dataset.ready = "true";
    render();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);

    return () => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const updatePointerGlow = (event: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    stage.style.setProperty(
      "--pointer-x",
      `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
    );
    stage.style.setProperty(
      "--pointer-y",
      `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
    );
  };

  const previewNode = (index: number | null) => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (index === null) {
      scene.removeAttribute("data-preview");
      return;
    }
    scene.dataset.preview = String(index);
  };

  return (
    <div className={styles.labShell}>
      <a className={styles.skipLink} href="#trace-story">
        Aller à la démonstration
      </a>

      <header className={styles.labHeader}>
        <Link className={styles.backLink} href="/">
          <span aria-hidden="true">←</span>
          Retour au portfolio
        </Link>
        <p>Prototype isolé · non indexé</p>
      </header>

      <main>
        <section className={styles.labHero}>
          <div className={styles.heroGrid} aria-hidden="true" />
          <p className={styles.eyebrow}>System trace / effect lab</p>
          <h1>
            Une chaîne de delivery
            <span> qui se raconte en mouvement.</span>
          </h1>
          <div className={styles.heroSummary}>
            <p>
              Le scroll ne décore pas la page : il rejoue le chemin réel d’un
              changement, du commit jusqu’au signal opérationnel.
            </p>
            <a href="#trace-story">Lancer la trace <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section
          className={styles.traceScene}
          id="trace-story"
          ref={sceneRef}
        >
          <div
            className={styles.traceStage}
            onPointerMove={updatePointerGlow}
            ref={stageRef}
          >
            <div className={styles.pointerGlow} aria-hidden="true" />
            <div className={styles.stagePanel}>
              <div className={styles.stageHeader}>
                <div>
                  <span className={styles.liveDot} aria-hidden="true" />
                  <span ref={statusRef}>TRACE 01 / 06</span>
                </div>
                <span>DELIVERY PATH · LIVE</span>
              </div>

              <svg
                className={styles.topology}
                viewBox="0 0 760 500"
                role="img"
                aria-label="Parcours de delivery du code aux métriques"
              >
                <defs>
                  <pattern id="trace-grid" width="38" height="38" patternUnits="userSpaceOnUse">
                    <path d="M 38 0 L 0 0 0 38" className={styles.gridLine} />
                  </pattern>
                  <filter id="trace-glow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="trace-gradient" x1="90" x2="675" y1="96" y2="382">
                    <stop offset="0%" stopColor="#FFBD74" />
                    <stop offset="58%" stopColor="#ABA2FF" />
                    <stop offset="100%" stopColor="#9188E3" />
                  </linearGradient>
                </defs>

                <rect width="760" height="500" fill="url(#trace-grid)" />
                <path className={styles.routeGhost} d={route} />
                <path
                  className={styles.routeProgress}
                  d={route}
                  ref={routeRef}
                />
                <circle
                  className={styles.signalPacket}
                  cx="90"
                  cy="96"
                  filter="url(#trace-glow)"
                  r="6"
                  ref={packetRef}
                />

                {nodes.map((node, index) => (
                  <g
                    data-active="false"
                    data-current="false"
                    data-node-index={index}
                    data-trace-node
                    key={node.label}
                    transform={`translate(${node.x} ${node.y})`}
                  >
                    <circle className={styles.nodeHalo} r="24" />
                    <circle className={styles.nodeRing} r="15" />
                    <circle className={styles.nodeCore} r="6" />
                    <g transform={`translate(${node.labelX} ${node.labelY})`}>
                      <rect className={styles.nodeLabelBox} height="30" rx="4" width={node.width} />
                      <text className={styles.nodeLabel} x="10" y="20">
                        {node.label}
                      </text>
                    </g>
                  </g>
                ))}
              </svg>

              <div className={styles.progressTrack} aria-hidden="true">
                <span />
              </div>
              <div className={styles.stageFooter}>
                <span>SCROLL TO INSPECT</span>
                <span>CODE → SIGNAL</span>
              </div>
            </div>
          </div>

          <ol className={styles.traceSteps} aria-label="Étapes de la chaîne de delivery">
            {steps.map((step, index) => (
              <li className={styles.traceStep} key={step.node}>
                <article
                  className={styles.stepCard}
                  data-active="false"
                  data-trace-step
                  onPointerEnter={() => previewNode(index)}
                  onPointerLeave={() => previewNode(null)}
                >
                  <div className={styles.stepMeta}>
                    <span>{step.index}</span>
                    <span>{step.node}</span>
                  </div>
                  <h2>{step.title}</h2>
                  <p>{step.body}</p>
                  <div className={styles.stepSignal}>
                    <i aria-hidden="true" />
                    {step.signal}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.labConclusion}>
          <p className={styles.eyebrow}>Trace complete / 06</p>
          <h2>
            Le système devient lisible.
            <span> La décision devient possible.</span>
          </h2>
          <p>
            Cette mécanique pourrait relier le hero, les preuves et l’offre
            sans ajouter un second langage visuel au portfolio.
          </p>
          <div className={styles.conclusionActions}>
            <Link href="/offer">Voir l’offre actuelle <span aria-hidden="true">→</span></Link>
            <Link href="/">Retour au portfolio</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
