---
version: 1
slug: "app-site-header-tsx"
primary_target: "app/site-header.tsx"
related_targets: ["app/site-header.module.css","app/arrow-icon.tsx"]
---

# Surface: shared site navigation (rail de commande)

Scope: `SiteHeader` (`app/site-header.tsx` + `site-header.module.css`), the header shared by `/`, `/offer` and `/projects/k8s-platform`. Validated on noindex preview routes, then shipped in place of the old header (2026-10-14). Visitor mode: Persuade (the nav carries the booking action on every page).

Audience/job: CTO / Lead Dev, mostly on a phone between meetings: see in one glance what the site holds (parcours, project, offer) and book from anywhere. Decided with Jack (2026-10-14): top level is one station per page, Accueil · Projets · Offre (a Parcours anchor duplicated the home in the sheet and could never light up); "Expertise" and "Contact" links leave the nav; Projets goes straight to `/projects/k8s-platform` (k8s-platform and platform-bot stay together; a `/projects` listing waits for its own design); booking CTA always visible, labelled "Planifier un échange" on desktop and "Contact" on mobile, via Cal.com with UTM placement `header`.

## Direction contract

THESIS: The navigation is a route, not a link list. Three stations in their fixed order sit on one line; the amber segment traces the path to the page you are on, and the route always ends on the booking action. On phones it moves under the thumb as a rail. Refuses the logo + links + hamburger dropdown template.

OWN-WORLD: The site's ink ground and hairline rules (rgba paper .18); stations are 10px topology nodes ringed in muted grey, the current one filled amber (#ffbd74) with the traced segment; CTA is the amber filled pill on ink. The index sheet is the offer's lavender paper (#d8d6e3), ink Arial, hairline rows hung on one vertical route axis, accessible violet (#4c40af) for the current row and its filled CTA. Arial throughout, numerals tabular, no glow, no glass.

STORY: The visitor knows where they are (lit station), what else exists (three named stations, one-line descriptions in the sheet) and that booking is one tap away on every page.

FIRST VIEWPORT: Desktop (≥760px): 84px fixed bar over the hero (transparent at the top, ink once scrolled, folding with the rail), logo and availability (≥1320px) left, the route centred with 01 Accueil · 02 Projets · 03 Offre, its hairline running on to the amber "Planifier un échange" pill right. Phone: 64px bar with logo and amber "Contact" pill; a 64px rail fixed 12px above the bottom edge with the three stations and "Plus"; "Plus" raises the lavender sheet from the bottom (01 Accueil → 03 Offre with descriptions, availability, violet CTA).

FORM: Structure "Rail de commande", ordered #5 on the grounded list; seed key 7ae7c332. Raises: fixed-order numbered stations (darkroom), one vertical axis in the sheet (deep dive), cells on the 64px blueprint module (ASCII). Signature interaction: the amber trace grows from the first station to the current one on load; the rail folds away while scrolling down and returns on scroll up. Motion grammar: exponential ease-out 220–420ms, reduced motion = static, rail always visible.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- `/projects` listing design (after this integration).
- Remaining `→` glyphs across the site to migrate to `ArrowIcon` (drawn so it can be animated in the next phase).
- Swipe-to-close on the sheet (Escape, close button and backdrop tap ship first).
