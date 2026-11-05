export const siteName = "Jacques Maarek — Platform Engineer";

// Canonical origin is a constant on purpose: deriving it from request headers
// (Host, X-Forwarded-Host) lets any client inject an arbitrary domain into
// canonical and og:url, and makes non-canonical hosts self-canonicalize.
export const siteOrigin = "https://jacques.podyourlife.fr";

export const siteHostname = new URL(siteOrigin).hostname;
