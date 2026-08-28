# Jacques Maarek Portfolio — Design System

> Source of truth for the portfolio and the CI/CD & observability offer.
> Page-specific rules may refine these foundations but must not redefine the brand.

## Product direction

The site positions Jacques Maarek as a senior freelance Platform Engineer: precise,
credible, pragmatic and production-oriented. The visual language is inspired by
infrastructure topology, operational signals and regulated environments. It must
never read as a generic SaaS landing page or a creative-effects portfolio.

The conversion sequence is:

1. Understand the profile and business outcome.
2. See expertise and professional proof.
3. Read measurable impact and the k8s-platform proof of execution.
4. Discover the short CI/CD & observability diagnostic.
5. Start a qualified conversation.

## Design principles

1. **Production clarity** — explain outcomes before tools and preserve factual detail.
2. **Controlled contrast** — dark cinematic storytelling alternates with mineral proof surfaces.
3. **Signals, not decoration** — orange marks actions, live state and critical topology routes.
4. **Technical legibility** — diagrams remain understandable without being required to read the copy.
5. **Measured motion** — one dominant motion system per viewport, with a complete reduced-motion path.
6. **Progressive conversion** — calls to action follow proof and use explicit, low-friction wording.

## Color system

### Dark portfolio surfaces

| Role | Value | Token |
|---|---:|---|
| Primary ink | `#0B0B0D` | `--ink` |
| Primary text | `#EFEDF5` | `--paper` |
| Muted text | `#AAA6B5` | `--muted` |
| Structural lavender | `#ABA2FF` | `--violet` |
| Accessible violet | `#5147B4` | `--violet-readable` |
| AWS-inspired action | `#FFBD74` | `--acid` |
| Warm text on orange | `#744814` | `--acid-readable` |
| Dark separators | `rgba(239, 237, 245, .18)` | `--line` |

### Mineral offer surfaces

| Role | Value | Token |
|---|---:|---|
| Offer ink | `#111014` | `--offer-ink` |
| Offer muted text | `#595663` | `--offer-muted` |
| Mineral base | `#D8D6E3` | `--offer-surface` |
| Mineral soft | `#E2DFEA` | `--offer-surface-soft` |
| Mineral deep | `#C9C6D8` | `--offer-surface-deep` |
| Accessible violet | `#4C40AF` | `--offer-violet` |
| Dark-surface lavender | `#9188E3` | `--offer-violet-soft` |

Verified contrast pairs include `#AAA6B5` on `#0B0B0D` (8.27:1),
`#FFBD74` on `#0B0B0D` (11.97:1), `#4C40AF` on `#C9C6D8` (4.72:1),
and `#595663` on `#D8D6E3` (4.99:1).

Orange is not a decorative third accent. Use it for availability, primary actions,
section indexing on dark surfaces and the active infrastructure route. Lavender
expresses structure, selected state, proof metrics and the offer’s primary hierarchy.

## Typography

- Font stack: `Arial, Helvetica, sans-serif` for predictable metrics and zero extra transfer.
- Body: `16px` minimum, `1.45–1.55` line height.
- Long-form measure: `55–75ch`.
- Display headings: tight tracking (`-0.04em` to `-0.075em`) with mobile clamps.
- Labels: `11–12px`, uppercase, never used for essential paragraph content.
- Avoid all-uppercase body copy and technology-heavy headlines without an outcome.
- Offer-section headlines use complete expert propositions that name the object, analysis or decision; avoid three-word slogan sequences and social-post cadence.
- Long offer headlines use a smaller editorial scale than the hero so expertise is read before visual impact.

## Layout and spacing

- Minimum supported width: `320px`; production verification starts at `375px`.
- Page gutter: `clamp(18px, 2.1vw, 30px)`.
- Desktop grid: 12 visual columns expressed through CSS Grid, not fixed containers.
- Section spacing: `92px` desktop, `58–70px` mobile depending on density.
- Interactive target: `44px` preferred; never below WCAG 2.2’s `24px` minimum without spacing.
- Cards use `6–8px` radii; pill radii are reserved for actions, tags and status.

Required verification widths:

| Width | Intent |
|---:|---|
| `375px` | Small mobile, stacked content and disclosure navigation |
| `768px` | Tablet, single-column hero and selective two-column proof |
| `1024px` | Laptop, disclosure navigation if status and links collide |
| `1440px` | Full editorial composition and topology context |

## Components

### Header

- One shared component across `/` and `/offer`.
- Desktop shows logo, availability and the five primary destinations.
- At `1120px` and below, use a disclosure menu with `aria-expanded`, Escape-to-close
  and at least `52px` menu rows.
- The active offer link uses `aria-current="page"` plus a visible underline.

### Calls to action

- Primary: warm filled pill on dark surfaces; violet control on mineral surfaces.
- Secondary: outlined pill with equal target height.
- Labels state the destination or next action: “Découvrir l’offre”, “Planifier un échange”.
- Never use an unlabeled arrow as the only conversion control.

### Cards and proof rows

- Borders carry structure; shadows remain subtle and never replace hierarchy.
- Non-interactive cards remain visually stable on hover so they never imply clickability.
- Interactive surfaces may change background or elevation but must not shift adjacent layout.
- Results stay factual and pair every large number with an explanatory sentence.

### Offer decision block

- State the decisions enabled by the diagnostic, not generic qualities such as clarity or reliability.
- Separate immediate, next-release and 30/60-day outcomes so buyers can project the operational value.
- Make recommendation traceability explicit: observation → risk → impact → action → priority.
- Keep this block distinct from scope, process and deliverables; it explains usefulness, not inventory.

### Experience tabs

- Follow the WAI-ARIA tabs pattern: one tab stop, arrow-key navigation, Home/End,
  linked `tab` and `tabpanel` IDs, and a focusable active panel.
- Selection must never rely on color alone.
- Capability and experience technology chips share one passive component. Their hover uses
  the accessible structural violet, a default cursor and no tooltip, arrow or layout movement.
  Convert a chip into a labelled keyboard-focusable link only when a real destination exists.

### Infrastructure visualizations

- Decorative canvases and SVG topologies are `aria-hidden`.
- Essential scope is repeated in semantic text or lists.
- Canvas labels remain stable and limited to the primary infrastructure path; animation must not cycle unrelated labels through the copy area.
- At mobile widths, hide offer topologies that cross actions and reduce homepage topology opacity below competing-text level.
- Linear flows use semantic ordered lists and reflow vertically instead of clipping.

### Final conversion surfaces

- Primary contact actions on mineral surfaces use a filled accessible-violet treatment, not a low-contrast outline that resembles a disabled state.
- Short conversion phrases containing a hyphen remain on one line at supported mobile widths.
- Hover feedback may change color or elevation but must not move a whole content row.

## Motion

- Entry duration: `300–680ms`; hover/focus feedback: `150–220ms`.
- Avoid simultaneous parallax, canvas animation and choreography in one viewport.
- Animate section-level groups rather than every child card; keep each viewport to one or two motion cues.
- Canvas animation pauses for `prefers-reduced-motion: reduce` and renders a static state.
- StringTune does not start when reduced motion is requested.
- Never animate layout properties or leave content hidden if motion does not run.

## Accessibility

- Target WCAG 2.2 AA.
- Maintain `4.5:1` contrast for normal text and `3:1` for large text and UI boundaries.
- Use a `3px` visible focus indicator with a `4px` offset on dark and light surfaces.
- Preserve semantic headings, landmarks, lists, native `details/summary` and skip links.
- All functionality must work with keyboard only and remain usable at 200% zoom.
- Do not disable browser zoom or communicate state by color alone.

## Anti-patterns

- Generic red or blue SaaS palettes.
- Multiple competing accent colors.
- Tiny horizontal navigation squeezed onto mobile.
- Topology labels placed beneath critical copy.
- Decorative motion continuing under reduced-motion preferences.
- Icon-only conversion links, vague “Explore” CTAs and homepage dead ends.
- Raw technology lists without a business outcome or proof.

## Pre-delivery checklist

- [ ] `/` and `/offer` tested at 375, 768, 1024 and 1440 px.
- [ ] No horizontal clipping or scroll.
- [ ] Mobile menu opens, closes, follows links and closes with Escape.
- [ ] Experience tabs work with Tab, arrows, Home and End.
- [ ] Focus is visible on every interactive control.
- [ ] Reduced-motion mode renders complete static content.
- [ ] FAQ, pricing links, anchors and mail links are reachable by keyboard.
- [ ] No new visual dependency or unexpected layout shift.
- [ ] Lint, build and source tests pass.
