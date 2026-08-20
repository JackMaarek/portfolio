"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  StringMagnetic,
  StringProgress,
  StringTune,
} from "@fiddle-digital/string-tune";

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

const offerFrictions = [
  {
    index: "01",
    title: "Déploiements\nrisqués",
    body: "Absence de garde-fous et de visibilité sur l’état réel de vos déploiements.",
    icon: "warning",
  },
  {
    index: "02",
    title: "Rollbacks\nflous",
    body: "Pas de traçabilité fiable pour revenir à un état sain en toute confiance.",
    icon: "rollback",
  },
  {
    index: "03",
    title: "Environnements\ndivergents",
    body: "Des environnements qui dérivent et masquent les vrais problèmes.",
    icon: "layers",
  },
  {
    index: "04",
    title: "Alertes\ninutiles",
    body: "Trop de bruit, pas de signal : vos équipes passent à côté de l’essentiel.",
    icon: "alert-off",
  },
];

const offerPillars = [
  { title: "Lisibilité", body: "Voir où la chaîne casse", icon: "eye" },
  { title: "Fiabilité", body: "Réduire le risque opérationnel", icon: "shield" },
  { title: "Opérabilité", body: "Diagnostiquer plus vite", icon: "target" },
];

const tune = (value: string, attributes: Record<string, string> = {}) =>
  ({ string: value, ...attributes }) as Record<string, string>;

function OfferIcon({ name }: { name: string }) {
  const iconProps = {
    "aria-hidden": true,
    fill: "none",
    viewBox: "0 0 48 48",
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (name === "warning") {
    return <svg {...iconProps}><path d="M24 6 44 41H4L24 6Z" /><path d="M24 17v11M24 35v1" /></svg>;
  }
  if (name === "rollback") {
    return <svg {...iconProps}><path d="M12 18V9m0 0h9m-9 0 5.2 5.2A21 21 0 1 1 10 30" /></svg>;
  }
  if (name === "layers") {
    return <svg {...iconProps}><path d="M7 7h25v25H7zM16 16h25v25H16z" /></svg>;
  }
  if (name === "alert-off") {
    return <svg {...iconProps}><path d="M12 34h24l-4-5V20a8 8 0 0 0-15-4M17 38a7 7 0 0 0 14 0M8 8l32 32" /><circle cx="36.5" cy="34.5" r="8.5" /></svg>;
  }
  if (name === "eye") {
    return <svg {...iconProps}><path d="M4 24s7-13 20-13 20 13 20 13-7 13-20 13S4 24 4 24Z" /><circle cx="24" cy="24" r="7" /></svg>;
  }
  if (name === "shield") {
    return <svg {...iconProps}><path d="M24 5c5 5 11 6 17 7v11c0 11-7 17-17 21C14 40 7 34 7 23V12c6-1 12-2 17-7Z" /><path d="m17 25 5 5 10-12" /></svg>;
  }
  return <svg {...iconProps}><circle cx="24" cy="24" r="9" /><path d="M24 4v10m0 20v10M4 24h10m20 0h10M10 10l7 7m14 14 7 7m0-28-7 7M17 31l-7 7" /></svg>;
}

function DeliveryPipeline() {
  const steps = ["Code", "CI", "Registry", "ArgoCD", "EKS"];

  return (
    <div className="delivery-pipeline" aria-label="Chaîne de delivery : Code, CI, Registry, ArgoCD, EKS">
      <span className="pipeline-start" aria-hidden="true" />
      {steps.map((step, index) => (
        <div className="pipeline-step" key={step}>
          <span className="pipeline-node" aria-hidden="true" />
          <span className="pipeline-label">{step}</span>
          {index < steps.length - 1 && <span className="pipeline-arrow" aria-hidden="true" />}
        </div>
      ))}
    </div>
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
    const persistentLabels = new Set([5, 8, 9]);
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
    };

    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    };

    const leave = () => {
      pointerX = -1000;
      pointerY = -1000;
    };

    const draw = (time: number) => {
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
            ? "rgba(226,255,85,.9)"
            : isCompletedRoute
              ? "rgba(226,255,85,.58)"
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
        context.strokeStyle = "rgba(226,255,85,.95)";
        context.stroke();
      }

      nodes.forEach(([x, y], index) => {
        const nodeX = x * width;
        const nodeY = y * height;
        const distance = Math.hypot(nodeX - pointerX, nodeY - pointerY);
        const proximity = Math.max(0, 1 - distance / 88);
        const isHovered = index === hoveredNode;
        const isAutoActive = index === activeFrom || index === activeTo;
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
            ? "rgba(226,255,85,.98)"
            : "rgba(236,234,255,.8)";
        context.shadowBlur = isHovered ? 24 : isAutoActive ? 12 + pulse * 8 : 0;
        context.shadowColor = "rgba(226,255,85,.75)";
        context.fill();
        context.shadowBlur = 0;
        if (isAutoActive || index === 2 || index === 5 || index === 8) {
          context.beginPath();
          context.arc(nodeX, nodeY, radius + 8, 0, Math.PI * 2);
          context.strokeStyle = isHovered || isAutoActive
            ? "rgba(226,255,85,.65)"
            : `rgba(172,164,255,${0.18 + pulse * 0.18})`;
          context.stroke();
        }
      });

      nodes.forEach(([x, y], index) => {
        const isHovered = index === hoveredNode;
        const isAutoActive = index === activeFrom || index === activeTo;
        const isPersistent = width > 520 && persistentLabels.has(index);
        if (!isHovered && !isAutoActive && !isPersistent) return;

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

        context.globalAlpha = isHovered ? 1 : isAutoActive ? 0.92 : 0.58;
        context.fillStyle = "rgba(11,11,13,.88)";
        context.strokeStyle =
          isHovered || isAutoActive
            ? "rgba(226,255,85,.72)"
            : "rgba(201,197,255,.35)";
        context.lineWidth = 1;
        context.fillRect(labelX, labelY, labelWidth, labelHeight);
        context.strokeRect(labelX, labelY, labelWidth, labelHeight);
        context.fillStyle =
          isHovered || isAutoActive
            ? "rgba(239,237,245,1)"
            : "rgba(239,237,245,.82)";
        context.textBaseline = "middle";
        context.fillText(label, labelX + 8, labelY + labelHeight / 2 + 0.5);
        context.restore();
      });

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    interactionSurface?.addEventListener("pointermove", move);
    interactionSurface?.addEventListener("pointerleave", leave);
    animationFrame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      interactionSurface?.removeEventListener("pointermove", move);
      interactionSurface?.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={canvasRef} className="topology" aria-hidden="true" />;
}

export function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeExperience, setActiveExperience] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stringTune = StringTune.getInstance();
    stringTune.scrollDesktopMode = "default";
    stringTune.scrollMobileMode = "default";
    stringTune.use(StringProgress);
    stringTune.use(StringMagnetic);
    stringTune.start(60);

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const sceneElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-scene]"),
    );

    if (reducedMotion) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return () => stringTune.destroy();
    }

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

  return (
    <main className="site-shell">
      <a className="skip-link" href="#main-content">Aller au contenu</a>
      <div className="noise" aria-hidden="true" />
      <header className="topbar">
        <a className="monogram" href="#top" aria-label="Retour en haut">
          <Image
            src="/logo-jm-header.png"
            alt=""
            width={48}
            height={48}
            priority
            unoptimized
          />
        </a>
        <div className="status">
          <span className="status-dot" />
          Disponible pour missions freelance
        </div>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? "Fermer" : "Menu"}
        </button>
        <nav id="main-nav" className={menuOpen ? "nav open" : "nav"}>
          <a href="#offre" onClick={() => setMenuOpen(false)}>Offre</a>
          <a href="#expertise" onClick={() => setMenuOpen(false)}>Expertise</a>
          <a href="#experience" onClick={() => setMenuOpen(false)}>Expérience</a>
          <a href="#projets" onClick={() => setMenuOpen(false)}>Projets</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
      </header>

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
          <a className="round-link" href="#experience" {...tune("magnetic")}>
            <span>Explorer</span>
            <span className="round-link-arrow" aria-hidden="true">↓</span>
          </a>
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

      <section id="offre" className="offer" aria-labelledby="offer-heading">
        <div className="offer-problem">
          <div className="offer-intro" data-reveal>
            <p className="offer-label"><span>02 /</span> Ce qui vous ralentit</p>
            <h2 id="offer-heading">
              Le problème<br />n’est pas<br />vos outils.<br />
              <span>C’est<br />ce qu’on ne voit plus.</span>
            </h2>
          </div>
          <div className="friction-grid">
            {offerFrictions.map((friction) => (
              <article className="friction-card" key={friction.index} data-reveal>
                <span className="friction-index">{friction.index}</span>
                <OfferIcon name={friction.icon} />
                <h3>{friction.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h3>
                <p>{friction.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="offer-promise">
          <div className="promise-copy" data-reveal>
            <p className="offer-label"><span>03 /</span> La promesse</p>
            <h2>
              En 3 à 5 jours,<br />une vision claire,<br />
              <span>priorisée et<br />actionnable.</span>
            </h2>
          </div>
          <div className="promise-content">
            <div className="promise-pillars">
              {offerPillars.map((pillar) => (
                <article className="promise-pillar" key={pillar.title} data-reveal>
                  <OfferIcon name={pillar.icon} />
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </article>
              ))}
            </div>
            <DeliveryPipeline />
          </div>
        </div>
      </section>

      <section id="expertise" className="capabilities">
        <div className="section-heading" data-reveal>
          <p className="section-label">04 / Expertise</p>
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
              <ul aria-label={`Technologies : ${capability.title}`}>
                {capability.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="experience">
        <div className="section-heading experience-heading" data-reveal>
          <p className="section-label">05 / Parcours</p>
          <h2>Livrer.<br />Fiabiliser.<br />Passer à l’échelle.</h2>
          <p className="experience-intro">
            De 2018 à aujourd’hui, du développement back-end aux enjeux de
            plateforme, dans des secteurs où la rigueur compte.
          </p>
        </div>
        <div className="experience-panel" data-reveal>
          <div className="experience-tabs" role="tablist" aria-label="Expériences">
            {experiences.map((item, index) => (
              <button
                key={item.company}
                type="button"
                role="tab"
                aria-selected={activeExperience === index}
                aria-controls={`experience-${index}`}
                onClick={() => setActiveExperience(index)}
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
              aria-hidden={activeExperience !== index}
            >
              <p className="detail-sector">{item.sector}</p>
              <h3>{item.role}</h3>
              <p className="detail-summary">{item.summary}</p>
              <ul className="detail-points">
                {item.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <ul className="tech-list" aria-label="Technologies">
                {item.tech.map((tech) => <li key={tech}>{tech}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="projets" className="projects scroll-scene" data-scroll-scene>
        <div className="project-visual" {...tune("progress", {"string-key": "--project-progress"})}>
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
          <p className="section-label">06 / Projet personnel</p>
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
            <a href="https://github.com/JackMaarek" target="_blank" rel="noreferrer" {...tune("magnetic")}>
              Voir sur GitHub <span aria-hidden="true">↗</span>
            </a>
            <span>CLI Go · platform-bot</span>
          </div>
        </article>
      </section>

      <section className="results scroll-scene" data-scroll-scene>
        <p className="section-label">07 / Impact mesurable</p>
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

      <footer id="contact" className="contact">
        <div className="contact-top">
          <p className="section-label">08 / Contact</p>
          <p>Un besoin plateforme, cloud<br />ou automatisation ?</p>
        </div>
        <a className="contact-mail" href="mailto:jacques.maarek.dev@gmail.com" {...tune("magnetic")}>
          Parlons-en<span aria-hidden="true">↗</span>
        </a>
        <div className="footer-meta">
          <span>Jacques Maarek · Platform Engineer</span>
          <a href="https://github.com/JackMaarek" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="#top">Retour en haut ↑</a>
          <span>Paris · 2026</span>
        </div>
      </footer>
    </main>
  );
}
