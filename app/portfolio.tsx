"use client";

import { useEffect, useRef, useState } from "react";
import {
  StringMagnetic,
  StringParallax,
  StringProgress,
  StringSplit,
  StringTune,
} from "@fiddle-digital/string-tune";

const experiences = [
  {
    period: "2025 — aujourd’hui",
    role: "Consultant technique & Business Development",
    company: "PerspeQtive",
    sector: "Défense · Spatial · Imagerie SAR",
    summary:
      "Co-développement d’un logiciel quantum-inspired appliqué à l’imagerie SAR, exécuté sur GPU standard et orchestré sur AWS en mode event-driven.",
    points: [
      "Déploiement de la chaîne d’analyse sur EKS avec S3, ArgoCD et Helm.",
      "Positionnement du produit auprès de l’écosystème défense et spatial français.",
      "Qualification d’acteurs comme l’ONERA, Quantonation, l’IGN/Cnam et Thales.",
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
    let pointerX = 0.66;
    let pointerY = 0.44;
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
    const links = [
      [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 5], [2, 6],
      [3, 6], [4, 5], [4, 7], [5, 8], [6, 8], [6, 10], [7, 8],
      [8, 9], [9, 10],
    ];

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
      pointerX = (event.clientX - rect.left) / rect.width;
      pointerY = (event.clientY - rect.top) / rect.height;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const pulse = (Math.sin(time * 0.0012) + 1) / 2;
      const active = Math.floor((time * 0.0015) % links.length);

      context.lineWidth = 1;
      links.forEach(([from, to], index) => {
        const [fromX, fromY] = nodes[from];
        const [toX, toY] = nodes[to];
        context.beginPath();
        context.moveTo(fromX * width, fromY * height);
        context.lineTo(toX * width, toY * height);
        context.strokeStyle =
          index === active ? "rgba(226,255,85,.95)" : "rgba(201,197,255,.2)";
        context.stroke();
      });

      nodes.forEach(([x, y], index) => {
        const distance = Math.hypot(x - pointerX, y - pointerY);
        const proximity = Math.max(0, 1 - distance * 2.8);
        const radius = 3 + proximity * 8 + (index % 3 === 0 ? pulse * 2 : 0);
        context.beginPath();
        context.arc(x * width, y * height, radius, 0, Math.PI * 2);
        context.fillStyle =
          proximity > 0.25 ? "rgba(226,255,85,.95)" : "rgba(236,234,255,.8)";
        context.fill();
        if (index === 2 || index === 5 || index === 8) {
          context.beginPath();
          context.arc(x * width, y * height, radius + 8, 0, Math.PI * 2);
          context.strokeStyle = `rgba(172,164,255,${0.18 + pulse * 0.18})`;
          context.stroke();
        }
      });

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", move);
    animationFrame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", move);
    };
  }, []);

  return <canvas ref={canvasRef} className="topology" aria-hidden="true" />;
}

export function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeExperience, setActiveExperience] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stringTune = StringTune.getInstance();
    stringTune.use(StringProgress);
    stringTune.use(StringParallax);
    stringTune.use(StringMagnetic);
    stringTune.use(StringSplit);
    stringTune.start(60);
    return () => stringTune.destroy();
  }, []);

  return (
    <main className="site-shell">
      <a className="skip-link" href="#main-content">Aller au contenu</a>
      <div className="noise" aria-hidden="true" />
      <header className="topbar">
        <a className="monogram" href="#top" aria-label="Retour en haut">
          JM<span>©26</span>
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
          <a href="#expertise" onClick={() => setMenuOpen(false)}>Expertise</a>
          <a href="#experience" onClick={() => setMenuOpen(false)}>Expérience</a>
          <a href="#projets" onClick={() => setMenuOpen(false)}>Projets</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <TopologyCanvas />
        <div className="hero-eyebrow" {...tune("parallax", {"string-factor": "-0.12"})}>
          <span>Platform Engineer</span>
          <span>Paris · France</span>
        </div>
        <div className="hero-copy">
          <h1 {...tune("split")}>
            Jacques
            <br />
            Maarek
          </h1>
          <p>
            Je construis les plateformes qui permettent aux équipes de livrer
            <em> plus vite</em>, sans transiger sur la sécurité.
          </p>
        </div>
        <div className="hero-foot">
          <a className="round-link" href="#experience" {...tune("magnetic")}>
            <span>Explorer</span>
            <span aria-hidden="true">↓</span>
          </a>
          <div className="coordinates">
            <span>48.8566° N</span>
            <span>02.3522° E</span>
          </div>
          <p>6+ années · Banque · Santé · Cyber · Défense</p>
        </div>
      </section>

      <section id="main-content" className="manifesto" {...tune("progress", {"string-key": "--section-progress"})}>
        <p className="section-label">01 / À propos</p>
        <div className="manifesto-copy">
          <p>
            Du <span>code back-end</span> aux plateformes Kubernetes
            multi-clusters.
          </p>
          <p>
            Une approche pragmatique de l’automatisation, de la sécurité et de
            la <span>fiabilité en production.</span>
          </p>
        </div>
        <aside>
          Expérience acquise dans des contextes où l’indisponibilité, la fuite
          d’un secret ou une dérive de coûts ne sont pas des détails.
        </aside>
      </section>

      <section id="expertise" className="capabilities">
        <div className="section-heading">
          <p className="section-label">02 / Expertise</p>
          <h2>Ce que je mets<br />en production.</h2>
        </div>
        <div className="capability-list">
          {capabilities.map((capability) => (
            <article className="capability" key={capability.index}>
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
        <div className="section-heading experience-heading">
          <p className="section-label">03 / Parcours</p>
          <h2>Construire.<br />Sécuriser.<br />Transmettre.</h2>
          <p className="experience-intro">
            De 2018 à aujourd’hui, du développement back-end aux enjeux de
            plateforme, dans des secteurs où la rigueur compte.
          </p>
        </div>
        <div className="experience-panel">
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

      <section id="projets" className="projects">
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
        <article className="project-copy">
          <p className="section-label">04 / Projet personnel</p>
          <p className="project-kicker">PodYourLife présente</p>
          <h2>k8s-platform</h2>
          <p className="project-lead">
            Une plateforme GitOps de référence pour concevoir, sécuriser et
            opérer plusieurs environnements Kubernetes sur AWS.
          </p>
          <div className="project-columns">
            <p>
              ArgoCD App-of-Apps, sync-waves, Terraform organisé par domaines
              et génération déterministe des branches d’environnement.
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
            <span>CLI Go · platform-botV2</span>
          </div>
        </article>
      </section>

      <section className="results">
        <p className="section-label">05 / Quelques repères</p>
        <div className="result-grid">
          <article>
            <strong>−50%</strong>
            <p>de coûts d’infrastructure et Kubernetes sur une mission bancaire.</p>
          </article>
          <article>
            <strong>≈150</strong>
            <p>équipes accompagnées au quotidien sur leurs processus de delivery.</p>
          </article>
          <article>
            <strong>0</strong>
            <p>credential statique dans la chaîne CI/CD de la plateforme de référence.</p>
          </article>
        </div>
      </section>

      <footer id="contact" className="contact">
        <div className="contact-top">
          <p className="section-label">06 / Contact</p>
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
