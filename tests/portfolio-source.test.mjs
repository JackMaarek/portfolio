import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("portfolio exposes its core positioning", async () => {
  const [portfolio, header] = await Promise.all([
    readFile(new URL("app/portfolio.tsx", projectRoot), "utf8"),
    readFile(new URL("app/site-header.tsx", projectRoot), "utf8"),
  ]);

  assert.match(portfolio, /Platform Engineer spécialisé Kubernetes/);
  assert.match(portfolio, /Le cloud, prêt pour la production/);
  assert.match(portfolio, /k8s-platform/);
  assert.match(portfolio, /platform-bot/);
  assert.match(portfolio, /github\.com\/PodYourLife\/k8s-platform/);
  assert.match(portfolio, /Découvrir l’offre/);
  assert.match(portfolio, /Diagnostic CI\/CD & Observabilité/);
  assert.ok(portfolio.includes('href="/offer"'));
  assert.ok(header.includes('portfolioHref: "#projects"'));
  assert.ok(!`${portfolio}${header}`.includes('href="/offre"'));
  assert.ok(!`${portfolio}${header}`.includes("#projets"));
});

test("shared navigation and experience tabs expose accessible interactions", async () => {
  const [portfolio, header, styles] = await Promise.all([
    readFile(new URL("app/portfolio.tsx", projectRoot), "utf8"),
    readFile(new URL("app/site-header.tsx", projectRoot), "utf8"),
    readFile(new URL("app/globals.css", projectRoot), "utf8"),
  ]);

  assert.match(header, /aria-expanded/);
  assert.match(header, /aria-controls="main-nav"/);
  assert.match(header, /event\.key !== "Escape"/);
  assert.match(header, /closeOnOutsidePointer/);
  assert.match(header, /min-width: 1121px/);
  assert.match(portfolio, /tabIndex=\{activeExperience === index \? 0 : -1\}/);
  assert.match(portfolio, /event\.key === "ArrowRight"/);
  assert.match(portfolio, /aria-orientation="vertical"/);
  assert.match(portfolio, /aria-labelledby=\{`experience-tab-/);
  assert.match(portfolio, /function TechnologyTags/);
  assert.ok(!portfolio.includes("data-status="));
  assert.match(portfolio, /Stack mobilisée/);
  assert.match(portfolio, /labelledBy=\{`experience-tech-/);
  assert.match(portfolio, /className="project-visual"[\s\S]*?aria-hidden="true"/);
  assert.match(styles, /@media \(max-width: 1120px\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /--offer-violet: #4c40af/);
  assert.match(styles, /\.nav a,[\s\S]*?min-height: var\(--touch-target\)/);
  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(styles, /\.technology-tag:hover::before/);
  assert.match(styles, /background: var\(--violet-readable\)/);
  assert.match(styles, /cursor: default/);
  assert.match(portfolio, /persistentLabels = new Set\(\[2, 3, 5\]\)/);
  assert.match(styles, /\.manifesto-copy p \+ p\s*\{\s*color: var\(--paper\)/);
  assert.match(styles, /\.contact-mail\s*\{[\s\S]*?white-space: nowrap/);
  assert.match(styles, /\.offer-contact-link\s*\{[\s\S]*?background: var\(--offer-violet\)/);
  assert.match(styles, /\.offer-issue:hover,[\s\S]*?\.offer-decisions article:hover/);
  assert.match(styles, /\.offer-scope-panel li:hover/);
  assert.match(styles, /\.offer-timeline article:hover::before/);
  assert.match(styles, /\.offer-faq details:hover/);
  assert.match(styles, /\.offer-faq details\[open\] p[\s\S]*?offer-faq-content-in/);
  assert.match(styles, /\.offer-primary-link:active,[\s\S]*?transform: scale\(\.985\)/);

  const reducedMotionRules = styles.slice(
    styles.indexOf("@media (prefers-reduced-motion: reduce)"),
  );
  assert.match(styles, /\.offer-motion-ready \[data-offer-reveal\]/);
  assert.ok(!styles.includes("animation-timeline: view()"));
  assert.match(
    reducedMotionRules,
    /\.technology-tag::before[\s\S]*?transition: none/,
  );
  assert.match(reducedMotionRules, /\.offer-plan:hover,[\s\S]*?transform: none/);
});

test("document metadata describes the portfolio", async () => {
  const [layout, sharedMetadata, offer] = await Promise.all([
    readFile(new URL("app/layout.tsx", projectRoot), "utf8"),
    readFile(new URL("app/site-metadata.ts", projectRoot), "utf8"),
    readFile(new URL("app/offer/page.tsx", projectRoot), "utf8"),
  ]);

  assert.match(sharedMetadata, /Jacques Maarek — Platform Engineer/);
  assert.match(sharedMetadata, /x-forwarded-host/);
  assert.match(layout, /Infrastructure as Code/);
  assert.match(layout, /alternates: \{ canonical:/);
  assert.match(layout, /<html lang="fr">/);
  assert.match(offer, /openGraph:/);
  assert.match(offer, /twitter:/);
  assert.match(offer, /canonical: `\$\{origin\}\/offer`/);
});

test("offer page exposes the commercial diagnostic", async () => {
  const [offer, header, motion] = await Promise.all([
    readFile(new URL("app/offer/page.tsx", projectRoot), "utf8"),
    readFile(new URL("app/site-header.tsx", projectRoot), "utf8"),
    readFile(new URL("app/offer-motion.tsx", projectRoot), "utf8"),
  ]);

  assert.ok(offer.includes("Diagnostic CI/CD & Observabilité"));
  assert.ok(offer.includes("Vos déploiements"));
  assert.ok(offer.includes("À partir de 1 560 € HT"));
  assert.ok(offer.includes("À partir de 2 600 € HT"));
  assert.ok(offer.includes("Roadmap 30/60 jours"));
  assert.ok(offer.includes("Planifier un échange"));
  assert.ok(offer.includes("Des constats traçables pour arbitrer les risques"));
  assert.ok(offer.includes("Une analyse progressive de la chaîne de delivery"));
  assert.ok(offer.includes("Cartographie des risques"));
  assert.ok(offer.includes("Savoir où agir d’abord"));
  assert.ok(offer.includes("Préparer le prochain déploiement"));
  assert.ok(offer.includes("Piloter la remédiation"));
  assert.ok(offer.includes('className="offer-recommendation-flow"'));
  assert.ok(offer.includes("Construction d’une recommandation"));
  assert.ok(!offer.includes("03 / La promesse"));
  assert.ok(!offer.includes("Comprendre."));
  assert.ok(!offer.includes("Priorisé. Actionnable."));
  assert.ok(offer.includes('<SiteHeader page="offer"'));
  assert.ok(offer.includes("<OfferMotion />"));
  assert.ok(offer.includes('data-offer-reveal="intro"'));
  assert.ok(offer.includes('data-offer-reveal="content"'));
  assert.ok(motion.includes("IntersectionObserver"));
  assert.ok(motion.includes("prefers-reduced-motion: reduce"));
  assert.ok(offer.includes('<main id="offer-main"'));
  assert.ok(offer.includes('href="#offer-main"'));
  assert.ok(header.includes('offerHref: "/offer"'));
  assert.ok(header.includes('offerHref: "/#projects"'));
  assert.ok(!`${offer}${header}`.includes('href="/offre"'));
  assert.ok(!offer.includes("offre-content"));
});

test("effect lab exposes an isolated accessible system trace", async () => {
  const [page, experience, styles] = await Promise.all([
    readFile(new URL("app/effect-lab/page.tsx", projectRoot), "utf8"),
    readFile(
      new URL("app/effect-lab/effect-lab-experience.tsx", projectRoot),
      "utf8",
    ),
    readFile(
      new URL("app/effect-lab/effect-lab.module.css", projectRoot),
      "utf8",
    ),
  ]);

  assert.match(page, /index: false/);
  assert.match(page, /follow: false/);
  assert.match(experience, /requestAnimationFrame/);
  assert.match(experience, /getPointAtLength/);
  assert.match(experience, /prefers-reduced-motion: reduce/);
  assert.match(experience, /aria-label="Parcours de delivery du code aux métriques"/);
  assert.match(experience, /data-trace-step/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.traceStage\s*\{[\s\S]*?position: sticky/);
});
