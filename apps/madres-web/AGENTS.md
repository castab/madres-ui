# madres-web — agent guide

The public SvelteKit site. Engineering rules and commands are in the [root `AGENTS.md`](../../AGENTS.md).
This file maps the app.

## Routes (`src/routes`)

| Path                                | What it does                                                                                                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `+layout.server.ts`                 | Sets `offeringAvailable` on every page. If it is false, the Inquire nav item is hidden and `inquire-cta.svelte` shows a "coming soon" toast button instead of a link. |
| `/` (`+page.*`, `landing-photos.*`) | Landing page. Server-loads gallery page 1 for the hero photo strip.                                                                                                   |
| `/gallery`                          | Instagram-style gallery from the presentation-service. `load-more/` and `track/` are JSON endpoints used by `gallery-client.svelte`.                                  |
| `/landing/track`                    | View and click tracking for the landing photos.                                                                                                                       |
| `/inquire`                          | Private-event catering form. Form state is in `inquire-form-state.svelte.ts`. Successful submissions redirect to `/inquire/sent`.                                     |

Gallery and landing pages set `prerender = false` because media URLs expire and must be fetched on each request.

## `src/env.ts`

Declares every env var the app reads (SvelteKit 3 `defineEnvVars`). Server code imports them from
`$app/env/private`, public ones from `$app/env/public`. A new var must be added here first. Keep
each one dynamic (no `static: true`) and optional (`input ?? ''`), so builds and startup work
without an env file and integrations fail closed.

## `src/lib`

- `server/`: server-only code.
  - `presentation-service/`: client for knurl's presentation-service. `transport.server.ts` handles env, URL validation, timeouts, and size caps; `gallery.server.ts` handles parsing and tracking.
  - `offering/`: parses `PRIVATE_EVENT_OFFERING_JSON` once per process and caches it. Returns `null` when the value is unset or invalid.
  - `turnstile/`: Cloudflare Turnstile token verification.
  - `email/`: staff notification email, sent through Resend's HTTP API.
  - `inquiry-rate-limit.server.ts`: in-memory, per-IP limit. Each process keeps its own count.
- `offering/`: logic shared by client and server. Contains the zod `schema.ts`, `types.ts`, `estimator.ts`, `money.ts` (integer cents), guest-count and quantity parsing, and test `fixtures.ts`.
- `components/`: site chrome (`site-header`, `site-footer`, `brand-mark`, and others). Also holds `inquire/` form widgets, `icons/`, and `ui/` (shadcn-svelte primitives, added with the shadcn-svelte CLI; see `.claude/skills/shadcn-svelte`).
- `styles.ts`: shared Tailwind class strings (`buttonBase`, `focusRing`, heading styles). Reuse them before writing new class lists.
- `utils.ts`: `cn()` and prop helper types.

## The `/inquire` action pipeline

`+page.server.ts` runs these steps in order: 503 if there is no offering → a filled `website` honeypot
redirects silently to `/inquire/sent` → rate limit → Turnstile verify → zod customer info →
validate selections against the **server-loaded** offering → compute the estimate → send the email →
`redirect(303, '/inquire/sent')`. Every failure returns `fail()` with a single `InquireActionResult` shape.
The client-side min/max enforcement exists for UX only, so keep the server checks authoritative.
`INQUIRY_DEV_ALLOWED_EMAIL` restricts sends in dev and staging (enforced in `email/inquiry-email.server.ts`).

## Styling

- Tokens are defined in `src/routes/layout.css` under `:root`: palette (`--luna-brown-*`, `--sol-yellow-*`, `--barro-tan`, `--talavera-white`, `--ink-*`), semantic tokens (`--surface-*`, `--text-*`, `--brand-*`, `--border-*`, `--focus-ring`), and type and spacing scales. Use the semantic tokens, e.g. `bg-(--surface-card)`.
- Fonts: Jost (sans, headings) and Cormorant Garamond (serif), both from `@fontsource`.

## Tests

- Vitest (`vite.config.ts`) has two projects. `server` runs `src/**/*.{test,spec}.ts` in Node. `client` runs `src/**/*.svelte.{test,spec}.ts` in browser Chromium. Tests sit next to their sources.
- Playwright (`e2e/*.e2e.ts`) runs against a production build on desktop and mobile Chromium. The presentation-service is replaced by `test/presentation-service-mock.mjs`. `PRIVATE_EVENT_OFFERING_JSON` is left empty, so e2e covers the "inquiry disabled" state.

## Svelte docs tooling

The Svelte MCP server comes from the `sveltejs/ai-tools` plugin, enabled in `.claude/settings.json` and
`.opencode/`. The same plugin provides a `svelte-file-editor` subagent for editing `.svelte` / `.svelte.ts` files.
When the server is available, follow the official usage guidance below. One deviation for this repo is under `svelte-autofixer`.

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues are returned.

**Repo deviation:** suggestions are advisory, not required. Mention any you see in your summary, but only
apply them when they concern code you're already changing for the task. Don't refactor existing code
just to clear them. Several components already trigger suggestions (`$effect` usage, `bind:this`,
attachments instead of actions).

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
