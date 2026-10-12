# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

CTOs and Lead Devs at French SMBs and scale-ups (roughly 10–200 people) with a small or absent platform team. They feel delivery pain — risky deployments, unclear rollbacks, drifting environments, noisy alerts — and are evaluating whether an external senior engineer can make their delivery chain readable in a few days. Most visits come from mobile.

## Product Purpose

A personal site for Jacques Maarek, Platform Engineer specialised in Kubernetes. The home page (`/`) presents experience and projects (`k8s-platform`, `platform-bot`); the offer page (`/offer`) sells a fixed-scope "Diagnostic CI/CD & Observabilité". Success is a booked discovery call through the booking link.

## Positioning

A short, priced, day-by-day diagnostic of the delivery chain (code → CI → registry → GitOps → cluster → observability) delivered by the engineer who builds such platforms himself. Findings are expressed as Observation → Risque → Impact → Action → Priorité and ranked by impact, probability and remediation effort — not by tool preference. The roadmap is written to be executable by the client's own team.

## Operating Context

Visitors compare against French DevOps/Kubernetes audit offers (cabinets and freelancers) that sell 2–10 day audits ending in a report and a prioritised roadmap. Evaluation happens on phones between meetings and on laptops when preparing a decision.

## Capabilities and Constraints

- Offer content source of truth: `app/offer/offer-content.ts` and `app/offer/offer-page-body.tsx` (French copy).
- Formats: Diagnostic court (3 days, from 1 560 € HT) and Diagnostic complet (5 days, from 2 600 € HT), days J1 Cadrage → J5 Restitution.
- Scope is the delivery chain (CI/CD, Docker, Kubernetes delivery, GitOps, logs/metrics/dashboards, basic alerting, operational docs, delivery debt). Network, IAM and data audits are not sold; Kubernetes is not required.
- Stack is named tool-agnostically, with common tools as examples (GitHub Actions/GitLab CI, ArgoCD/Flux, EKS/GKE, Prometheus/Grafana/Loki).
- Method may reference DORA metrics, the CIS Kubernetes/EKS benchmark and Google SRE golden signals, without claiming certification.
- Stack: Next.js 16 on vinext/Vite, deployed to Cloudflare Workers; `main` deploys to production automatically.
- Experiments live on noindex preview routes before any change to `/` or `/offer`.

## Brand Commitments

- First-person professional French voice, concrete and sober; no hype.
- Existing offer visual language must be reused: dark ink hero with blueprint grid, lavender light bands, violet accents, amber traced route, topology nodes.
- Real copy only: never placeholder or invented text, testimonials, clients or metrics.

## Evidence on Hand

- Public repos: `github.com/PodYourLife/k8s-platform`, `platform-bot`.
- Offer copy, pricing, FAQ and deliverables in `app/offer/`.
- No client testimonials, case studies, logos or measured client results exist; do not fabricate them.

## Product Principles

1. Make delivery risk legible before proposing tools.
2. Every claim maps to a check the client can verify.
3. Mobile reading comes first; motion never hides content.
4. Prioritise by impact, probability and effort; the client's team must be able to act alone.

## Accessibility & Inclusion

Keyboard-navigable scenes with skip links, reduced-motion support, decorative layers hidden from assistive tech, 44px touch targets.
