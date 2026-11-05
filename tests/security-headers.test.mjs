import assert from "node:assert/strict";
import test from "node:test";
import { withSecurityHeaders } from "../worker/security-headers.ts";

const htmlResponse = () =>
  new Response("<!doctype html>", { headers: { "content-type": "text/html" } });

test("canonical host gets hardening headers and stays indexable", () => {
  const hardened = withSecurityHeaders(htmlResponse(), new URL("https://jacques.podyourlife.fr/offer"));

  assert.equal(hardened.headers.get("x-content-type-options"), "nosniff");
  assert.equal(hardened.headers.get("x-frame-options"), "DENY");
  assert.equal(hardened.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(hardened.headers.get("strict-transport-security"), "max-age=31536000");
  assert.match(hardened.headers.get("permissions-policy"), /camera=\(\)/);
  assert.equal(hardened.headers.get("x-robots-tag"), null);
  assert.equal(hardened.headers.get("content-type"), "text/html");
});

test("non-canonical hosts are never indexed", () => {
  for (const alias of ["https://portfolio.jack.workers.dev/", "https://evil.example/"]) {
    const hardened = withSecurityHeaders(htmlResponse(), new URL(alias));
    assert.equal(hardened.headers.get("x-robots-tag"), "noindex, nofollow");
  }
});

test("local development is left indexable and without HSTS", () => {
  const hardened = withSecurityHeaders(htmlResponse(), new URL("http://localhost:3000/"));
  assert.equal(hardened.headers.get("x-robots-tag"), null);
  assert.equal(hardened.headers.get("strict-transport-security"), null);
});

test("headers already set upstream are not overridden", () => {
  const upstream = new Response("", { headers: { "referrer-policy": "no-referrer" } });
  const hardened = withSecurityHeaders(upstream, new URL("https://jacques.podyourlife.fr/"));
  assert.equal(hardened.headers.get("referrer-policy"), "no-referrer");
});
