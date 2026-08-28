"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  StringMagnetic,
  StringProgress,
  StringTune,
} from "@fiddle-digital/string-tune";
import { SiteHeader } from "./site-header";

const experiences = [
  {
    period: "2025 — aujourd’hui",
    role: "Consultant technique",
    company: "PerspeQtive",
    sector: "R&D appliquée · Imagerie SAR",
    summary:
      "Conception de la plateforme d’exécution d’un algorithme quantum-inspired appliqué à l’imagerie SAR : workloads GPU sur AWS, orchestration event-driven et déploiements Kubernetes pilotés par GitOps.",
    points: [
      "Architecture de la chaîne d’exécution sur EKS avec S3, ArgoCD et Helm.",
      "Orchestration event-driven des traitements SAR sur instances GPU AWS.",
      "Adaptation de mon socle Kubernetes/GitOps personnel aux contraintes du projet.",
    ],
    tech: ["EKS", "ArgoCD", "Helm", "S3", "GPU", "SAR"],
  },
  {
    period: "2023 — 2024",
    role: "Platform Engineer",
    company: "MIRAGE",
    sector: "Plateforme · Delivery",
    summary:
      "Construction de la fondation d’infrastructure, de la toolchain de delivery et de l’observabilité d’une plateforme Kubernetes.",
    points: [
      "Repository Terraform et provisioning automatisé des applications.",
      "Pipelines CI/CD, analyse statique et templatisation de la toolchain.",
      "Dashboards Prometheus/Grafana et documentation des services.",
    ],
    tech: ["Terraform", "Kubernetes", "GitLab CI", "Go", "Prometheus", "Grafana"],
  },
  {
    period: "2021 — 2023",
    role: "Platform Engineer",
    company: "Padok",
    sector: "Banque · Santé · Cybersécurité",
    summary:
      "Missions de plateforme sur des environnements réglementés : sécurité automatisée, DevEx, FinOps, multi-comptes AWS et delivery à grande échelle.",
    points: [
      "Réduction de moitié des coûts d’infrastructure et du cluster Kubernetes.",
      "Support delivery et amélioration de la DevEx pour environ 150 équipes.",
      "Migration AWS multi-comptes et automatisations nécessaires à la certification HDS.",
    ],
    tech: ["AWS", "Terraform", "Kubernetes", "ArgoCD", "GitLab CI", "Datadog"],
  },
  {
    period: "2019 — 2021",
    role: "Back-end Developer / DevOps",
    company: "Risk&Me",
    sector: "Cybersécurité",
    summary:
      "Développement d’une plateforme de sensibilisation à la cybersécurité et transformation progressive de son architecture.",
    points: [
      "Migration d’un monolithe Symfony vers des microservices Go.",
      "Migration de Windows Server vers AWS.",
      "Création de l’IaC Terraform et des clusters Kubernetes de production.",
    ],
    tech: ["Go", "Symfony", "AWS", "Terraform", "Kubernetes", "MySQL"],
  },
  {
    period: "2018 — 2019",
    role: "Back-end Developer / DevOps",
    company: "Les Amis d’Hubert · Sauvel Natal",
    sector: "Services · E-commerce",
    summary:
      "Premières expériences back-end autour d’outils métier, d’e-commerce, de facturation et de migrations vers AWS.",
    points: [
      "Back-office de gestion de contenu, comptabilité et facturation.",
      "Gestion de stocks et numérisation des caisses via RFID.",
      "Mise en place et migration d’infrastructures AWS.",
    ],
    tech: ["PHP", "Symfony", "MySQL", "Docker", "AWS", "Terraform"],
  },
];

const capabilities = [
  {
    index: "01",
    title: "Platform Engineering",
    body: "Des plateformes pensées comme des produits : standards clairs, self-service, automatisation et expérience développeur.",
    tags: ["Kubernetes", "EKS", "ArgoCD", "Helm"],
  },
  {
    index: "02",
    title: "Infrastructure as Code",
    body: "Des infrastructures AWS reproductibles, structurées par domaine et livrées sans credentials statiques.",
    tags: ["Terraform", "AWS", "GitHub Actions", "OIDC"],
  },
  {
    index: "03",
    title: "Sécurité & fiabilité",
    body: "La sécurité intégrée à la plateforme : mTLS, politiques d’admission, secrets externalisés et observabilité.",
    tags: ["Istio", "Kyverno", "ESO", "Prometheus"],
  },
];

const tune = (value: string, attributes: Record<string, string> = {}) =>
  ({ string: value, ...attributes }) as Record<string, string>;

type TechnologyTagsProps = {
  items: string[];
  label?: string;
  labelledBy?: string;
};

function TechnologyTags({ items, label, labelledBy }: TechnologyTagsProps) {
  return (
    <ul
      className="technology-tags"
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {items.map((item) => (
        <li className="technology-tag" key={item}>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TopologyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pointerX = -1000;
    let pointerY = -1000;
    let isInViewport = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interactionSurface = canvas.closest<HTMLElement>(".hero");
    const nodes = [
      [0.12, 0.28],
      [0.34, 0.16],
      [0.59, 0.25],
      [0.82, 0.12],
      [0.25, 0.55],
      [0.5, 0.48],
      [0.77, 0.58],
      [0.13, 0.82],
      [0.42, 0.78],
      [0.68, 0.88],
      [0.9, 0.77],
    ];
    const nodeLabels = [
      "Client",
      "Edge",
      "Ingress",
      "GitOps",
      "API",
      "EKS",
      "Queue",
      "Database",
      "GPU",
      "S3",
      "Metrics",
    ];
    const persistentLabels = new Set([2, 3, 5]);
    const links = [
      [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 5], [2, 6],
      [3, 6], [4, 5], [4, 7], [5, 8], [6, 8], [6, 10], [7, 8],
      [8, 9], [9, 10],
    ];
    const deploymentRoute = [0, 1, 2, 5, 8, 9];
    const segmentDuration = 820;
    const routeHoldDuration = 1500;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (reducedMotion) draw(6200);
    };

    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      if (reducedMotion) draw(6200);
    };

    const leave = () => {
      pointerX = -1000;
      pointerY = -1000;
      if (reducedMotion) draw(6200);
    };

    const draw = (time: number) => {
      animationFrame = 0;
      context.clearRect(0, 0, width, height);
      const pulse = (Math.sin(time * 0.0012) + 1) / 2;
      const travelDuration = (deploymentRoute.length - 1) * segmentDuration;
      const routeElapsed = time % (travelDuration + routeHoldDuration);
      const routeIsComplete = routeElapsed >= travelDuration;
      const completedSegments = routeIsComplete
        ? deploymentRoute.length - 1
        : Math.floor(routeElapsed / segmentDuration);
      const activeRouteStep = Math.min(
        completedSegments,
        deploymentRoute.length - 2,
      );
      const activeFrom = deploymentRoute[activeRouteStep];
      const activeTo = deploymentRoute[activeRouteStep + 1];
      const segmentProgress = routeIsComplete
        ? 1
        : (routeElapsed % segmentDuration) / segmentDuration;
      let hoveredNode = -1;
      let closestDistance = 88;

      nodes.forEach(([x, y], index) => {
        const distance = Math.hypot(x * width - pointerX, y * height - pointerY);
        if (distance < closestDistance) {
          closestDistance = distance;
          hoveredNode = index;
        }
      });

      links.forEach(([from, to]) => {
        const [fromX, fromY] = nodes[from];
        const [toX, toY] = nodes[to];
        const isHoveredLink = from === hoveredNode || to === hoveredNode;
        const routeSegmentIndex = deploymentRoute.findIndex(
          (node, index) =>
            index < deploymentRoute.length - 1 &&
            node === from &&
            deploymentRoute[index + 1] === to,
        );
        const isCompletedRoute =
          routeSegmentIndex >= 0 && routeSegmentIndex < completedSegments;
        context.beginPath();
        context.moveTo(fromX * width, fromY * height);
        context.lineTo(toX * width, toY * height);
        context.lineWidth = isHoveredLink ? 1.7 : 1;
        context.strokeStyle =
          isHoveredLink
            ? "rgba(255,189,116,.9)"
            : isCompletedRoute
              ? "rgba(255,189,116,.58)"
            : "rgba(201,197,255,.2)";
        context.stroke();
      });

      if (!routeIsComplete) {
        const [fromX, fromY] = nodes[activeFrom];
        const [toX, toY] = nodes[activeTo];
        context.beginPath();
        context.moveTo(fromX * width, fromY * height);
        context.lineTo(
          (fromX + (toX - fromX) * segmentProgress) * width,
          (fromY + (toY - fromY) * segmentProgress) * height,
        );
        context.lineWidth = 1.8;
        context.strokeStyle = "rgba(255,189,116,.95)";
        context.stroke();
      }

      nodes.forEach(([x, y], index) => {
        const nodeX = x * width;
        const nodeY = y * height;
        const distance = Math.hypot(nodeX - pointerX, nodeY - pointerY);
        const proximity = Math.max(0, 1 - distance / 88);
        const isHovered = index === hoveredNode;
        const isAutoActive = !reducedMotion && (index === activeFrom || index === activeTo);
        const routeNodeIndex = deploymentRoute.indexOf(index);
        const isRouteReached =
          routeNodeIndex >= 0 && routeNodeIndex <= completedSegments;
        const radius =
          3 +
          proximity * 9 +
          (isAutoActive
            ? 3 + pulse * 2
            : isRouteReached
              ? 1.5
              : index % 3 === 0
                ? pulse * 2
                : 0);
        context.beginPath();
        context.arc(nodeX, nodeY, radius, 0, Math.PI * 2);
        context.fillStyle =
          proximity > 0 || isAutoActive || isRouteReached
            ? "rgba(255,189,116,.98)"
            : "rgba(236,234,255,.8)";
        context.shadowBlur = isHovered ? 24 : isAutoActive ? 12 + pulse * 8 : 0;
        context.shadowColor = "rgba(255,189,116,.75)";
        context.fill();
        context.shadowBlur = 0;
        if (isAutoActive || index === 2 || index === 5 || index === 8) {
          context.beginPath();
          context.arc(nodeX, nodeY, radius + 8, 0, Math.PI * 2);
          context.strokeStyle = isHovered || isAutoActive
            ? "rgba(255,189,116,.65)"
            : `rgba(172,164,255,${0.18 + pulse * 0.18})`;
          context.stroke();
        }
      });

      nodes.forEach(([x, y], index) => {
        const isHovered = index === hoveredNode;
        const isPersistent =
          window.innerWidth > 1024 && persistentLabels.has(index);
        if (!isHovered && !isPersistent) return;

        const nodeX = x * width;
        const nodeY = y * height;
        const label = nodeLabels[index].toUpperCase();
        context.save();
        context.font = "600 10px Arial, sans-serif";
        const labelWidth = context.measureText(label).width + 16;
        const labelHeight = 24;
        let labelX = nodeX + 14;
        let labelY = nodeY - 30;

        if (index === 10) {
          labelX = nodeX + 10;
          labelY = nodeY + 14;
        }
        if (labelX + labelWidth > width - 4) {
          labelX = nodeX - labelWidth - 14;
        }
        if (labelY < 4) {
          labelY = nodeY + 14;
        }

        context.globalAlpha = isHovered ? 1 : 0.68;
        context.fillStyle = "rgba(11,11,13,.88)";
        context.strokeStyle =
          isHovered
            ? "rgba(255,189,116,.72)"
            : "rgba(201,197,255,.35)";
        context.lineWidth = 1;
        context.fillRect(labelX, labelY, labelWidth, labelHeight);
        context.strokeRect(labelX, labelY, labelWidth, labelHeight);
        context.fillStyle =
          isHovered
            ? "rgba(239,237,245,1)"
            : "rgba(239,237,245,.82)";
        context.textBaseline = "middle";
        context.fillText(label, labelX + 8, labelY + labelHeight / 2 + 0.5);
        context.restore();
      });

      scheduleDraw();
    };

    function scheduleDraw() {
      if (reducedMotion || !isInViewport || document.hidden || animationFrame) return;
      animationFrame = requestAnimationFrame(draw);
    }

    const pauseDraw = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isInViewport = entry.isIntersecting;
      if (isInViewport) scheduleDraw();
      else pauseDraw();
    });

    const handleVisibilityChange = () => {
      if (document.hidden) pauseDraw();
      else scheduleDraw();
    };

    resize();
    visibilityObserver.observe(canvas);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    interactionSurface?.addEventListener("pointermove", move);
    interactionSurface?.addEventListener("pointerleave", leave);
    if (!reducedMotion) scheduleDraw();
    return () => {
      pauseDraw();
      visibilityObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      interactionSurface?.removeEventListener("pointermove", move);
      interactionSurface?.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={canvasRef} className="topology" aria-hidden="true" />;
}

export function Portfolio() {
  const [activeExperience, setActiveExperience] = useState(0);
  const experienceTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const sceneElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-scene]"),
    );

    if (reducedMotion) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      sceneElements.forEach((element) => element.style.setProperty("--scene-progress", ".5"));
      return;
    }

    const stringTune = StringTune.getInstance();
    stringTune.scrollDesktopMode = "default";
    stringTune.scrollMobileMode = "default";
    stringTune.use(StringProgress);
    stringTune.use(StringMagnetic);
    stringTune.start(60);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    revealElements.forEach((element) => observer.observe(element));

    let frame = 0;
    const updateScenes = () => {
      const viewportHeight = window.innerHeight;
      sceneElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const progress = Math.min(
          1,
          Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)),
        );
        element.style.setProperty("--scene-progress", progress.toFixed(4));
      });
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScenes);
    };
    updateScenes();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      stringTune.destroy();
    };
  }, []);

  const selectExperience = (index: number, moveFocus = false) => {
    setActiveExperience(index);
    if (moveFocus) {
      window.requestAnimationFrame(() => experienceTabRefs.current[index]?.focus());
    }
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#portfolio-main">Aller au contenu</a>
      <div className="noise" aria-hidden="true" />
      <SiteHeader page="portfolio" />

      <main id="portfolio-main" className="page-main" tabIndex={-1}>
        <section id="top" className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <TopologyCanvas />
        <div className="hero-eyebrow">
          <span>Jacques Maarek</span>
          <span>Platform Engineer · Paris</span>
        </div>
        <div className="hero-copy">
          <h1 data-reveal>
            Platform Engineer spécialisé Kubernetes, GitOps et Infrastructure
            as Code
          </h1>
          <div className="hero-statement" aria-label="Le cloud, prêt pour la production">
            <span className="statement-line"><i>Le cloud,</i></span>
            <span className="statement-line"><i>prêt pour</i></span>
            <span className="statement-line accent-line"><i>la production.</i></span>
          </div>
          <div className="hero-summary" data-reveal>
            <p>
              J’industrialise l’infrastructure. Vos équipes déploient plus vite,
              avec moins de risques.
            </p>
            <span>Kubernetes · AWS · Terraform · ArgoCD</span>
          </div>
        </div>
        <div className="hero-foot">
          <div className="hero-actions">
            <Link className="hero-offer-link" href="/offer">
              <span>Découvrir l’offre</span>
              <span aria-hidden="true">→</span>
            </Link>
            <a className="round-link" href="#experience" {...tune("magnetic")}>
              <span>Voir le parcours</span>
              <span className="round-link-arrow" aria-hidden="true">↓</span>
            </a>
          </div>
          <p>6+ années · Banque · Santé · Cyber</p>
        </div>
        </section>

      <section
        id="main-content"
        className="manifesto scroll-scene"
        data-scroll-scene
      >
        <p className="section-label">01 / À propos</p>
        <div className="manifesto-copy" data-reveal>
          <p>
            Du <span>back-end</span> au multi-cluster.
          </p>
          <p>
            J’automatise l’infrastructure, sécurise les flux et fiabilise
            <span> chaque mise en production.</span>
          </p>
        </div>
        <aside data-reveal>
          Expérience acquise dans des contextes où l’indisponibilité, la fuite
          d’un secret ou une dérive de coûts ne sont pas des détails.
        </aside>
      </section>

      <section id="expertise" className="capabilities">
        <div className="section-heading" data-reveal>
          <p className="section-label">02 / Expertise</p>
          <h2>Ce que je<br />construis.</h2>
        </div>
        <div className="capability-list">
          {capabilities.map((capability) => (
            <article className="capability" key={capability.index} data-reveal>
              <span className="capability-index">{capability.index}</span>
              <div>
                <h3>{capability.title}</h3>
                <p>{capability.body}</p>
              </div>
              <TechnologyTags
                items={capability.tags}
                label={`Technologies : ${capability.title}`}
              />
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="experience">
        <div className="section-heading experience-heading" data-reveal>
          <p className="section-label">03 / Parcours</p>
          <h2>
            Du back-end aux plateformes<br />
            cloud industrialisées.
          </h2>
          <p className="experience-intro">
            De 2018 à aujourd’hui, du développement back-end aux enjeux de
            plateforme, dans des secteurs où la rigueur compte.
          </p>
        </div>
        <div className="experience-panel" data-reveal>
          <div
            className="experience-tabs"
            role="tablist"
            aria-label="Expériences"
            aria-orientation="vertical"
          >
            {experiences.map((item, index) => (
              <button
                key={item.company}
                ref={(element) => { experienceTabRefs.current[index] = element; }}
                id={`experience-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={activeExperience === index}
                aria-controls={`experience-${index}`}
                tabIndex={activeExperience === index ? 0 : -1}
                onClick={() => selectExperience(index)}
                onKeyDown={(event) => {
                  const lastIndex = experiences.length - 1;
                  let nextIndex: number | null = null;

                  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    nextIndex = index === lastIndex ? 0 : index + 1;
                  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    nextIndex = index === 0 ? lastIndex : index - 1;
                  } else if (event.key === "Home") {
                    nextIndex = 0;
                  } else if (event.key === "End") {
                    nextIndex = lastIndex;
                  }

                  if (nextIndex !== null) {
                    event.preventDefault();
                    selectExperience(nextIndex, true);
                  }
                }}
              >
                <span>{item.period}</span>
                <strong>{item.company}</strong>
                <i aria-hidden="true">↗</i>
              </button>
            ))}
          </div>
          {experiences.map((item, index) => (
            <article
              key={`${item.company}-panel`}
              id={`experience-${index}`}
              className={activeExperience === index ? "experience-detail active" : "experience-detail"}
              role="tabpanel"
              aria-labelledby={`experience-tab-${index}`}
              tabIndex={0}
              hidden={activeExperience !== index}
            >
              <p className="detail-sector">{item.sector}</p>
              <h3>{item.role}</h3>
              <p className="detail-summary">{item.summary}</p>
              <ul className="detail-points">
                {item.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <div className="tech-stack">
                <p className="tech-stack-label" id={`experience-tech-${index}`}>
                  Stack mobilisée
                </p>
                <TechnologyTags
                  items={item.tech}
                  labelledBy={`experience-tech-${index}`}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className="projects scroll-scene" data-scroll-scene>
        <div
          className="project-visual"
          aria-hidden="true"
          {...tune("progress", {"string-key": "--project-progress"})}
        >
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="core">
            <span>GitOps</span>
            <strong>Desired<br />State</strong>
          </div>
          <span className="orbit-label label-one">EKS</span>
          <span className="orbit-label label-two">ArgoCD</span>
          <span className="orbit-label label-three">Terraform</span>
          <span className="orbit-label label-four">Policy</span>
        </div>
        <article className="project-copy" data-reveal>
          <p className="section-label">04 / Projet personnel</p>
          <p className="project-kicker">PodYourLife présente</p>
          <h2>k8s-platform</h2>
          <p className="project-lead">
            Du service applicatif au workload ML/GPU : un socle Kubernetes et
            GitOps pour déployer simplement sur AWS, piloté par une CLI interne.
          </p>
          <div className="project-columns">
            <p>
              platform-bot prépare et configure les environnements. ArgoCD,
              Helm et Terraform assurent des déploiements reproductibles.
            </p>
            <p>
              Istio mTLS strict, Kyverno, External Secrets Operator, OIDC et
              observabilité Prometheus, Grafana et Loki.
            </p>
          </div>
          <div className="project-actions">
            <a
              href="https://github.com/PodYourLife/k8s-platform"
              target="_blank"
              rel="noreferrer"
              aria-label="Voir k8s-platform sur GitHub (nouvel onglet)"
              {...tune("magnetic")}
            >
              Voir sur GitHub <span aria-hidden="true">↗</span>
            </a>
            <span>CLI Go · platform-bot</span>
          </div>
        </article>
      </section>

      <section className="results scroll-scene" data-scroll-scene>
        <p className="section-label">05 / Impact mesurable</p>
        <div className="result-grid">
          <article data-reveal>
            <strong>−50%</strong>
            <p>de coûts d’infrastructure et Kubernetes sur une mission bancaire.</p>
          </article>
          <article data-reveal>
            <strong>≈150</strong>
            <p>équipes accompagnées au quotidien sur leurs processus de delivery.</p>
          </article>
        </div>
      </section>

      <section className="offer-bridge" aria-labelledby="offer-bridge-title">
        <div className="offer-bridge-heading" data-reveal>
          <p className="section-label">06 / Diagnostic CI/CD & Observabilité</p>
          <h2 id="offer-bridge-title">
            Une intervention courte pour rendre votre delivery
            <span> lisible et actionnable.</span>
          </h2>
        </div>
        <div className="offer-bridge-copy" data-reveal>
          <p>
            En 3 à 5 jours, j’identifie les risques de votre chaîne de delivery,
            les angles morts d’observabilité et les actions à prioriser.
          </p>
          <ul aria-label="Périmètre du diagnostic">
            <li>CI/CD</li>
            <li>Kubernetes & GitOps</li>
            <li>Observabilité</li>
            <li>Roadmap 30/60 jours</li>
          </ul>
          <Link className="offer-bridge-link" href="/offer">
            Découvrir le diagnostic <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      </main>

      <footer id="contact" className="contact">
        <div className="contact-top">
          <p className="section-label">07 / Contact</p>
          <p>Un besoin plateforme, cloud<br />ou automatisation ?</p>
        </div>
        <a className="contact-mail" href="mailto:jacques.maarek.dev@gmail.com" {...tune("magnetic")}>
          Parlons-en<span aria-hidden="true">↗</span>
        </a>
        <div className="footer-meta">
          <span>Jacques Maarek · Platform Engineer</span>
          <a
            href="https://github.com/JackMaarek"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub de Jacques Maarek (nouvel onglet)"
          >
            GitHub ↗
          </a>
          <a href="#top">Retour en haut ↑</a>
          <span>Paris · 2026</span>
        </div>
      </footer>
    </div>
  );
}
