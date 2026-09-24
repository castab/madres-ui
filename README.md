# madres-ui

Public-facing web app for Madres Taco Shop — built with **Svelte 5** (runes) on **Vite 8**, via SvelteKit 2.

## Prerequisites

- **Node.js `v26.9.0`** — pinned in `.nvmrc`. `.npmrc` sets `engine-strict=true`, so `npm install` refuses to run on any other version.
- **npm** (bundled with Node) — this repo uses **npm workspaces**, not pnpm or yarn.

## Getting started

```sh
# 1. Use the pinned Node version
nvm use

# 2. Install dependencies (run from the repo root — installs all workspaces)
npm install

# 3. (Optional) configure the gallery's backend integration
cp apps/madres-web/.env.example apps/madres-web/.env
# fill in PRESENTATION_SERVICE_*; without it, the gallery route fails
# closed to an empty state rather than erroring

# 4. Start the dev server
npm run dev
```

The app is served at `http://localhost:5173` by default.

## Project structure

This is an **npm-workspaces monorepo**. Today it holds one app:

```
apps/
  madres-web/   # the SvelteKit public site (all root scripts delegate here)
                # madrestacoshop.com / dev.madrestacoshop.com
```

An admin app (`admin.madrestacoshop.com` / `admin-dev.madrestacoshop.com`) will land under `apps/` later.

## Scripts

Run from the **repo root**:

| Script              | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR            |
| `npm run build`     | Production build (SvelteKit + `adapter-node`) |
| `npm run preview`   | Preview the production build locally          |
| `npm run check`     | Type-check the project with `svelte-check`    |
| `npm run lint`      | Check formatting (Prettier) and lint (ESLint) |
| `npm run format`    | Auto-format the codebase with Prettier        |
| `npm run test:unit` | Run Vitest unit tests                         |
| `npm run test:e2e`  | Run Playwright end-to-end tests               |
| `npm run test`      | Run unit tests, then e2e tests                |

Run `npm run release:preflight -- vX.Y.Z` before tagging a release. See [RELEASING.md](RELEASING.md) for the development and production deployment paths and the full procedure.

## Tech stack

- **Svelte 5** (runes-only) + **SvelteKit 2**, on **Vite 8**
- **Tailwind CSS v4** (CSS-first config) + **shadcn-svelte** components
- **Vitest** (unit) + **Playwright** (e2e)
- Ships as a standalone Node server via `@sveltejs/adapter-node` — see `apps/madres-web/Dockerfile` for the deployable container build

See [`apps/madres-web/README.md`](apps/madres-web/README.md) and [`apps/madres-web/AGENTS.md`](apps/madres-web/AGENTS.md) for app-specific details, and this repo's own [`AGENTS.md`](AGENTS.md) for engineering conventions.
