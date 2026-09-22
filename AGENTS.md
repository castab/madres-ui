# AGENTS.md

## Role & Context

You are a specialist Svelte 5 + TypeScript engineer working in this npm-workspaces
monorepo (`apps/madres-web`, a SvelteKit 2 app on Vite 8, Tailwind v4, shadcn-svelte).
You write **runes-only Svelte 5** — this codebase has no Svelte 4 idioms, and none
should be introduced. When in doubt, match the patterns already in `apps/madres-web/src`.

This file covers engineering/style conventions. For project-specific rules (brand
palette, the gallery/presentation-service integration spec), see
`apps/madres-web/AGENTS.md`.

## Critical Boundaries

### Reactivity & state

- ALWAYS use Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`) for reactivity.
  Never use legacy Svelte 4 top-level `let` reactivity (`$:`) or writable stores, unless
  bridging to a legacy library that only exposes a store-based API.
- For `Set`/`Map` state that must react to in-place mutation (`.add()`, `.set()`,
  `.delete()`), use `SvelteSet`/`SvelteMap` from `svelte/reactivity` — `$state(new Set())`
  does **not** make `.add()` reactive, only variable reassignment. This has already caused
  one production bug in this repo; do not reintroduce it.
- Use `untrack()` from `svelte` when a value must intentionally be read once (e.g. seeding
  local `$state` from an initial prop, like React's `useState(initialValue)`) — don't
  silence the `state_referenced_locally` warning any other way.

### Component props

- ALWAYS explicitly type component props with a `Props` type/interface and destructure via
  `$props()`: `let { prop1, prop2 }: Props = $props()`. Never leave props implicitly typed.
- Prefer `WithElementRef<T>` / `WithoutChildren<T>` helpers from `$lib/utils.ts` for
  components that forward a DOM element ref or accept `children`.

### Templates & composition

- NEVER use `<svelte:options accessors />` — it's deprecated.
- NEVER use old slot syntax (`<slot>`, `let:x`). Use **snippets** (`{#snippet x()}`,
  `{@render x()}`) for all content projection, including default "children" content.
- Use plain DOM event attributes (`onclick`, `onchange`, …), not the `on:click` directive.
- Prefer `{#key}` to force a full remount when a child's internal state must fully reset
  on a prop change, rather than hand-rolling a "did the identity change?" comparison.

## Core Commands

Run from the repo root (delegates to the `madres-web` workspace):

```sh
npm run dev         # start the dev server (HMR)
npm run build        # production build
npm run preview      # preview the production build
npm run check         # svelte-check (type errors/warnings)
npm run lint          # prettier --check + eslint
npm run format        # prettier --write
npm run test:unit    # vitest
npm run test:e2e     # playwright
```

Treat `npm run check` output as authoritative — 0 errors AND 0 warnings before considering
a change done. `npm run lint` must also be clean; Prettier config uses tabs, single quotes,
no trailing commas (see `apps/madres-web/prettier.config.js`).

## Code Style

```svelte
<script lang="ts">
	import { cn } from '$lib/utils.js';

	type Props = {
		label: string;
		initial?: number;
		class?: string;
	};

	let { label, initial = 0, class: className }: Props = $props();

	let count = $state(initial);
	let doubled = $derived(count * 2);

	function increment() {
		count += 1;
	}
</script>

<div class={cn('flex items-center gap-3 rounded-lg border p-4', className)}>
	<span class="font-medium">{label}</span>
	<button type="button" onclick={increment}>
		{count} (×2 = {doubled})
	</button>
</div>

<style>
	div {
		background: var(--surface-card, #fff);
	}
</style>
```

File layout order is always: `<script lang="ts">` → template markup → scoped `<style>`.
