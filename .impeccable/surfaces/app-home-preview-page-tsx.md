---
version: 2
slug: "app-home-preview-page-tsx"
primary_target: "app/home-preview/page.tsx"
related_targets: ["app/career/career-column.tsx", "app/career/platform-breakdown.tsx", "app/home-content.ts"]
---

# Surface: /home-preview (noindex test route)

Scope: render test of the home page in the "parcours" layout. Hero, about, expertise, offer bridge and contact stay; the parcours, project and impact sections become two scenes. Not linked from `/` or `/offer`; never indexed. Mockup validated by Jack: `design-previews/home-parcours-mockup.html`.

Audience/job: CTO / Lead Dev checking whether the engineer behind the offer has built such platforms. Content source: `app/home-content.ts` only. References: a card carousel around a column (studio site, scroll turns the column) and an "object breakdown" exploded view.

## Direction contract

THESIS: Each subject gets its own scene. The missions are a column you turn, one mission at a time in front as a dossier sheet; k8s-platform is the one real architecture, shown as an exploded view. Replaces v1 (a 3D stack rebuilt mission by mission), rejected as not telling enough and mixing career chronology with architecture.

OWN-WORLD: The offer world: ink #0b0b0d blueprint grid, amber (#ffbd74) route and current state, violet (#aba2ff) for what is described in code, lavender sheets (#d8d6e3) with ink type and hairline rules. Arial, as on the whole site. No glow halos, no particles.

STORY:
- Parcours (03): an amber column; the five missions around it in a helix, chronological. The scroll turns it; the current mission comes to the front as a lavender sheet (year, company, period · role · sector, summary, Padok's −50% / ≈150, stack) and its three achievements leave it as separate leaves. Missions behind are glass with year and company only. Year index bottom-left; no expertise filter (expertise tags overlap almost every mission).
- Projet (04): k8s-platform's layers bottom to top (AWS · Terraform · OIDC as a dashed blueprint, EKS, ArgoCD · Helm, Istio mTLS · Kyverno · External Secrets Operator, Prometheus · Grafana · Loki) separate as the section is pinned, are named in turn (amber plate + legend line), then close back on the assembled platform. Copy and GitHub link on the left, legend with platform-bot on the right.

FORM: CSS 3D only, no WebGL on the home: one custom property per scene (--p, --explode) updated by a scroll handler that only runs near the section; React re-renders only when the current mission or layer changes. Content stays real HTML (collapsed details remain in the accessibility tree).

Phones and tablets (below 1000px wide or 620px high): missions in the page flow along the column, sticky year chips; exploded view in flow, its layers following the section's pass across the viewport.

Motion grammar: scroll-linked positions; front sheet and leaves ease in (cubic-bezier(.16, 1, .3, 1)); reduced motion removes the transitions.

## Unresolved
- Full browser checklist (keyboard, reduced motion) before replacing the classic sections on `/`.
- Whether StringTune is still needed once the classic sections go.
