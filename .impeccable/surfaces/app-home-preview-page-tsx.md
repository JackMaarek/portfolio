---
version: 1
slug: "app-home-preview-page-tsx"
primary_target: "app/home-preview/page.tsx"
related_targets: ["app/career/career-stack.tsx", "app/career/stack-scene.ts", "app/home-content.ts", "app/scene/"]
---

# Surface: /home-preview (noindex test route)

Scope: render test of the home page in the "stack" layout. The hero, the offer bridge and the contact stay; the about, expertise, parcours, project and impact sections become one scroll scene. Not linked from `/` or `/offer`; never indexed. Visitor mode: profile first (who builds platforms, with what proof), then the bridge to the diagnostic.

Audience/job: CTO / Lead Dev checking whether the engineer behind the offer has built such platforms. Content source: `app/home-content.ts` only (about, missions, capabilities, project, results). Structure follows the method of the offer dossier: pinned model, sheets scrolling over it, page index. Avoid: CV timeline with logos, gaming look, invented metrics or clients.

## Direction contract

THESIS: The career is a stack, not a CV. One platform model stays on screen; each mission sheet adds the layer that mission brought, and the camera steps back as the stack grows. Refuses the category default of a vertical job timeline with tabs.

OWN-WORLD: The offer dossier world (app/scene): ink #0b0b0d blueprint floor, matte ink blocks with paper edges, amber (#ffbd74) for what the current mission adds and live flows, violet (#aba2ff) for what is described rather than built (Terraform, Docker, mTLS) and for the teams. Lavender sheets (#d8d6e3) with ink type, hairline rules and a folio.

STORY: The cover shows the finished platform under "Du back-end au multi-cluster", then it dissolves and is rebuilt from 2018: a Symfony monolith in Docker on one AWS account → Go microservices on Kubernetes → multi-account AWS, ArgoCD, half the worker nodes gone (−50%) and ≈150 teams around the stack → GitLab CI and Prometheus/Grafana → GPU nodes fed from S3 → k8s-platform's mTLS, Kyverno, External Secrets and platform-bot → the three capabilities named as the tiers of the stack.

FIRST VIEWPORT: Unchanged hero (2D topology canvas). The stack scene loads only when the parcours nears the viewport.

FORM: Code-led extension of the dossier engine (shared app/scene); structure pinned by the user.

Each part of the stack declares the mission that brings it and, if any, the one that replaces it (monolith, Docker, single AWS account, the dropped nodes); labels only use technologies listed for that mission. Results figures sit on the Padok sheet, where they were measured.

Signature interaction: scroll scrubs the camera and the build state together; the cover → 2018 transition dissolves the finished platform into its first layer.
Motion grammar: exponential ease-out camera damping, parts settle onto the stack from just above; reduced motion = instant reframes, static flows. Idle frames at 30 fps; nothing renders off-screen.

## Unresolved
- Review on mobile (390px) and desktop before replacing the classic sections on `/`.
- Whether StringTune (magnetic links, project progress) is still needed once the classic sections go.
