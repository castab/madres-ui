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

The Svelte MCP server (the `sveltejs/ai-tools` plugin, enabled in `.claude/settings.json` and `.opencode/`) provides
`list-sections` / `get-documentation` for Svelte and SvelteKit docs, plus `svelte-autofixer`. When it is
available, run `svelte-autofixer` on new or changed `.svelte` files until it reports no issues.
