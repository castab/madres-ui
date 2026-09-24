# AGENTS.md

Madres Taco Shop's public website. npm-workspaces monorepo with one app today:
`apps/madres-web` (SvelteKit 2, Svelte 5 runes-only, Vite 8, Tailwind v4, shadcn-svelte,
built with `adapter-node` and deployed to Railway).

## Where to look

| Need                                                    | Read                                                                  |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| App architecture: routes, `$lib` layout, integrations   | [`apps/madres-web/AGENTS.md`](apps/madres-web/AGENTS.md)              |
| Env vars and the `/inquire` offering JSON schema        | [`apps/madres-web/.env.example`](apps/madres-web/.env.example)        |
| Setup, scripts, stack                                   | [`README.md`](README.md)                                              |
| Deploy and release (Railway, tags, preflight)           | [`RELEASING.md`](RELEASING.md)                                        |
| Brand palette, type scale, spacing tokens               | `apps/madres-web/src/routes/layout.css` (`:root` custom props)        |
| Shared Tailwind class recipes (buttons, headings, etc.) | `apps/madres-web/src/lib/styles.ts`                                   |
| shadcn-svelte / email skills                            | `.claude/skills/` (mirrored in `.agents/skills/`, `skills-lock.json`) |

## Commands (run from the repo root)

- Node **v26.9.0** is required (`.nvmrc`; `engine-strict` makes `npm install` refuse other versions). Use `nvm use`.
- `npm run check` — svelte-check. Must report **0 errors and 0 warnings**.
- `npm run lint` — Prettier check + ESLint. Fix formatting with `npm run format`.
- `npm run test:unit -- --run` — Vitest once (bare `test:unit` starts watch mode).
- `npm run test:e2e` — Playwright; builds the app and starts a mock presentation-service (`apps/madres-web/test/presentation-service-mock.mjs`). It runs `playwright install` first.
- `npm run dev` — dev server on `http://localhost:5173`.

A change is done when `check`, `lint`, and unit tests are clean. CI (`.github/workflows/ci.yml`)
also runs `build` and the e2e suite.

## Hard rules

**Svelte 5, runes only.** Match existing patterns in `apps/madres-web/src`.

- Reactivity via `$state` / `$derived` / `$props` / `$effect`. No `$:`, no writable stores, no `$app/stores` (use `$app/state`).
- Reactive `Set`/`Map` must be `SvelteSet`/`SvelteMap` from `svelte/reactivity`; `$state(new Set())` does not track `.add()`. This has caused a production bug here.
- Read a prop once to seed local state with `untrack()`; don't silence `state_referenced_locally` any other way.
- Type props explicitly: `let { a, b }: Props = $props()`. Use `WithElementRef` / `WithoutChildren` from `$lib/utils.ts` when forwarding refs or taking `children`.
- Snippets (`{#snippet}` / `{@render}`) only, never `<slot>` / `let:`. DOM event attributes (`onclick`), never `on:click`. No `<svelte:options accessors />`.
- Use `{#key}` to fully remount a child when a prop change must reset its internal state.
- File order: `<script lang="ts">`, then markup, then `<style>`. Prettier: tabs, single quotes, no trailing commas.

**App invariants.** Details are in `apps/madres-web/AGENTS.md`.

- Secrets and outbound calls live only in `src/lib/server/**` and read env via `$env/dynamic/*`, never `$env/static/*`, so builds succeed without an env file.
- Every integration **fails closed**. If config is missing or a call fails, the page degrades to a safe empty or "not available" state and does not throw.
- `/inquire` content, prices, and limits come from `PRIVATE_EVENT_OFFERING_JSON`, not source. Money is **integer cents**. The server re-validates everything the client submits.
- Style with the CSS tokens in `layout.css` (e.g. `text-(--text-primary)`), not raw hex values.
- Never commit real offering data, prices, or keys. `.env.example` holds fictional or test values only.
