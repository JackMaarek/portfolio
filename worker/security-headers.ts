/**
 * Response hardening applied to every document served by the Worker.
 *
 * Deliberately excludes a Content-Security-Policy for now: the site relies on
 * inline styles, StringTune and a lazily loaded three.js bundle, and Cloudflare
 * Web Analytics injects its beacon at the edge. A CSP needs its own audited PR
 * (report-only first) rather than a guess that could break production.
 */
const CANONICAL_HOSTNAME = "jacques.podyourlife.fr";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

const STATIC_SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  // Nothing on the site is meant to be framed; blocks clickjacking.
  ["X-Frame-Options", "DENY"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()"],
  ["Cross-Origin-Opener-Policy", "same-origin"],
];

// No includeSubDomains/preload: other podyourlife.fr subdomains are out of scope.
const HSTS_VALUE = "max-age=31536000";

export function isCanonicalHost(hostname: string): boolean {
  return hostname === CANONICAL_HOSTNAME;
}

export function withSecurityHeaders(response: Response, requestUrl: URL): Response {
  // Copy into a mutable response: upstream headers may be immutable.
  const hardened = new Response(response.body, response);

  for (const [headerName, headerValue] of STATIC_SECURITY_HEADERS) {
    if (!hardened.headers.has(headerName)) {
      hardened.headers.set(headerName, headerValue);
    }
  }

  if (requestUrl.protocol === "https:") {
    hardened.headers.set("Strict-Transport-Security", HSTS_VALUE);
  }

  // workers.dev, preview URLs and any other alias must never be indexed:
  // only the canonical hostname competes in search results.
  if (!isCanonicalHost(requestUrl.hostname) && !LOCAL_HOSTNAMES.has(requestUrl.hostname)) {
    hardened.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return hardened;
}
