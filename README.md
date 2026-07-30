# Jacques Maarek — Portfolio

Interactive portfolio presenting Jacques Maarek's Platform Engineering
experience, infrastructure work, and Kubernetes projects.

## Stack

- React 19
- Next.js 16
- vinext and Vite
- Cloudflare Workers
- StringTune
- Tailwind CSS

## Requirements

- Node.js 22.13 or later
- npm

## Local development

```bash
npm install
npm run dev
```

The development server uses port `3000` by default.

## Validation

```bash
npm run lint
npm test
npm run build
```

## Deployment

The application is configured for Cloudflare Workers through the Cloudflare
Vite plugin and Wrangler.

Build the production bundle:

```bash
npm run build
```

Deploy it after authenticating Wrangler with your Cloudflare account:

```bash
npx wrangler deploy
```

The repository can also be connected to Cloudflare Workers Builds for automatic
deployments from the `main` branch.

## Project structure

- `app/portfolio.tsx`: content, interactions, and topology animation
- `app/globals.css`: visual system and responsive layout
- `app/layout.tsx`: metadata and document structure
- `public/`: public assets
- `worker/`: Cloudflare Worker entry point
