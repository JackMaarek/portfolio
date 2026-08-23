import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("portfolio exposes its core positioning", async () => {
  const portfolio = await readFile(
    new URL("app/portfolio.tsx", projectRoot),
    "utf8",
  );

  assert.match(portfolio, /Platform Engineer spécialisé Kubernetes/);
  assert.match(portfolio, /Le cloud, prêt pour la production/);
  assert.match(portfolio, /k8s-platform/);
  assert.match(portfolio, /platform-bot/);
  assert.ok(portfolio.includes('href="/offer"'));
  assert.ok(portfolio.includes('href="#projects"'));
  assert.ok(!portfolio.includes('href="/offre"'));
  assert.ok(!portfolio.includes("#projets"));
});

test("document metadata describes the portfolio", async () => {
  const layout = await readFile(new URL("app/layout.tsx", projectRoot), "utf8");

  assert.match(layout, /Jacques Maarek — Platform Engineer/);
  assert.match(layout, /Infrastructure as Code/);
  assert.match(layout, /<html lang="fr">/);
});

test("offer page exposes the commercial diagnostic", async () => {
  const offer = await readFile(
    new URL("app/offer/page.tsx", projectRoot),
    "utf8",
  );

  assert.ok(offer.includes("Diagnostic CI/CD & Observabilité"));
  assert.ok(offer.includes("Vos déploiements"));
  assert.ok(offer.includes("À partir de 3 900 € HT"));
  assert.ok(offer.includes("Roadmap 30/60 jours"));
  assert.ok(offer.includes('href="/offer"'));
  assert.ok(offer.includes('href="/#projects"'));
  assert.ok(!offer.includes('href="/offre"'));
  assert.ok(!offer.includes("offre-content"));
});
