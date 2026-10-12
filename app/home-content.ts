// Home page copy shared by its layouts: the classic sections and the
// career stack preview read the same source.

export const about = {
  label: "01 / À propos",
  // `accent` is the part of each line set in the accent colour.
  headline: { text: "Du back-end au multi-cluster.", accent: "back-end" },
  statement: {
    text: "J’automatise l’infrastructure, sécurise les flux et fiabilise chaque mise en production.",
    accent: " chaque mise en production.",
  },
  aside:
    "Expérience acquise dans des contextes où l’indisponibilité, la fuite d’un secret ou une dérive de coûts ne sont pas des détails.",
};

export const experiences = [
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

export const capabilities = [
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

export const project = {
  label: "04 / Projet personnel",
  kicker: "PodYourLife présente",
  name: "k8s-platform",
  lead: "Du service applicatif au workload ML/GPU : un socle Kubernetes et GitOps pour déployer simplement sur AWS, piloté par une CLI interne.",
  columns: [
    "platform-bot prépare et configure les environnements. ArgoCD, Helm et Terraform assurent des déploiements reproductibles.",
    "Istio mTLS strict, Kyverno, External Secrets Operator, OIDC et observabilité Prometheus, Grafana et Loki.",
  ],
  repository: "https://github.com/PodYourLife/k8s-platform",
  cli: "CLI Go · platform-bot",
};

// Measured on the Padok missions (see experiences).
export const results = [
  { figure: "−50%", body: "de coûts d’infrastructure et Kubernetes sur une mission bancaire." },
  { figure: "≈150", body: "équipes accompagnées au quotidien sur leurs processus de delivery." },
];
