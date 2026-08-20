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
});

test("portfolio exposes the diagnostic offer", async () => {
  const portfolio = await readFile(
    new URL("app/portfolio.tsx", projectRoot),
    "utf8",
  );

  assert.match(portfolio, /Ce qui vous ralentit/);
  assert.match(portfolio, /Déploiements\\nrisqués/);
  assert.match(portfolio, /En 3 à 5 jours/);
  assert.match(portfolio, /Chaîne de delivery/);
});

test("document metadata describes the portfolio", async () => {
  const layout = await readFile(new URL("app/layout.tsx", projectRoot), "utf8");

  assert.match(layout, /Jacques Maarek — Platform Engineer/);
  assert.match(layout, /Infrastructure as Code/);
  assert.match(layout, /<html lang="fr">/);
});
