---
version: 1
slug: "app-offer-dossier-preview-page-tsx"
primary_target: "app/offer/dossier-preview/page.tsx"
related_targets: []
---

# Surface: /offer/dossier-preview (noindex test route)

Scope: render test of a 3D "engineering dossier" for the Diagnostic CI/CD & Observabilité. Not linked from `/` or `/offer`; never indexed. Visitor mode: Experience (the diagnostic itself leads), with the offer's booking action at the close.

Audience/job: CTO / Lead Dev evaluating how the diagnostic is actually run. Content source: `app/offer/offer-content.ts` + drafted audit detail (pending Jack's review). Structure pinned by the user: living architecture → per-component zoom per day → Kubernetes cluster dive on J3 → restitution. Scroll-driven with a page index. Avoid: gaming/sci-fi look, unreadable audit text, slow first load.

## Direction contract

THESIS: The diagnostic is a camera, not a list. One delivery-chain model stays on screen; each dossier page reframes it on the component audited that day. Refuses the category default of a numbered J1–J5 timeline with icon cards.

OWN-WORLD: Ink #0b0b0d blueprint ground with the offer's 64px grid as the scene floor; nodes are matte ink pucks ringed in paper grey; the audited route and live traffic are amber (#ffbd74); scope highlights in violet (#aba2ff). Dossier sheets are the offer's lavender paper (#d8d6e3) with ink Arial type, a folio line and hairline rules. No glow halos, no particles beyond route traffic.

STORY: The visitor sees the whole chain alive, follows the auditor component by component, understands what is checked and why it matters, ends on ranked findings and books a call.

FIRST VIEWPORT: Full-bleed scene with the six-node chain under a low three-quarter camera, traffic moving. Cover sheet anchored lower-left (bottom on mobile): title from the offer's diagnostic heading, the four blind spots, scroll cue. Page index fixed on the right edge (bottom bar on mobile). Booking action lives on the J5 sheet.

FORM: Code-led extension of the incumbent /offer world; structure pinned by the user (no concept-seed roll); seed key: none (pinned brief).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Day representations (no decorative device — each shows what is audited): J1 survey line charts the chain; J2 CI → Registry opens into Build/Tests/Scan/Publication stages with a flaky tests stage, a gate and a registry version stack with a rollback arc; J3 cluster namespaces with GitOps sync wave and one drifted staging pod; J4 golden-signal bars with an alert threshold the error bar crosses; J5 findings fly from their nodes onto an impact × effort grid labelled "Exemple de classement" (ranking method shown, no client ranking claimed).
Signature interaction: scroll scrubs the camera between page framings; on J3 the cluster puck opens into namespaces with pods syncing from the GitOps node.
Motion grammar: exponential ease-out camera damping; reduced motion = instant reframes, static traffic.

## Unresolved
- Audit detail copy is a draft for Jack's review.
- Mobile optimisation pass after render validation.
