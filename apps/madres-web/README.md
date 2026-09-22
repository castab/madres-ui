# madres-web

Public-facing SvelteKit site for Madres Taco Shop.

## Developing

From the repo root:

```sh
npm install
npm run dev
```

Or from this directory: `npm run dev`.

## Building

```sh
npm run build
```

Preview the production build with `npm run preview`. Deploys as a standalone Node server via `@sveltejs/adapter-node` (see `vite.config.ts`).

## Environment

See `.env.example` for the gallery's presentation-service integration variables, and for
`PRIVATE_EVENT_OFFERING_JSON`, which drives the entire `/inquire` private-event catering form
(pricing, options, and selection limits) — see the comment above it in that file for details.
