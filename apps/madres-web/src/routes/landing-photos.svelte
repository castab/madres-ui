<script lang="ts">
	import { resolve } from '$app/paths';
	import { SvelteSet } from 'svelte/reactivity';
	import type { GalleryTile } from '$lib/server/presentation-service/gallery.server.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { eyebrow, headingSection } from '$lib/styles.js';
	import LightboxCarousel from './gallery/lightbox-carousel.svelte';
	import { tileAlt } from './gallery/gallery-helpers.js';

	type Props = { tiles: GalleryTile[] };
	let { tiles }: Props = $props();

	const instagramHandle = 'madrestacos';
	const loadedIds = new SvelteSet<string>();
	const trackedViewIds = new SvelteSet<string>();
	let activeIndex = $state(-1);
	const active = $derived(activeIndex >= 0 ? tiles[activeIndex] : null);

	function close() {
		activeIndex = -1;
	}

	function showModal(node: HTMLDialogElement) {
		node.showModal();
		return {
			destroy() {
				if (node.open) node.close();
			}
		};
	}

	function prev() {
		activeIndex = (activeIndex - 1 + tiles.length) % tiles.length;
	}

	function next() {
		activeIndex = (activeIndex + 1) % tiles.length;
	}

	function track(id: string, event: 'view' | 'click') {
		void fetch('/landing/track', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ id, event }),
			keepalive: true
		}).catch(() => {});
	}

	$effect(() => {
		if (!active || trackedViewIds.has(active.id)) return;
		trackedViewIds.add(active.id);
		track(active.id, 'view');
	});

	// Keep the Image objects alive for this page visit so completed large requests can be
	// reused by the lightbox. Use the exact URL it renders, including any presigned query.
	$effect(() => {
		const images = [...new Set(tiles.map((tile) => tile.mediaItems[0].largeUrl))].map((url) => {
			const image = new Image();
			image.decoding = 'async';
			image.src = url;
			void image.decode().catch(() => {});
			return image;
		});
		return () => {
			images.length = 0;
		};
	});
</script>

<section>
	<div
		class="mx-auto flex max-w-(--container-max) flex-col gap-(--stack-gap) px-(--gutter) py-(--section-y)"
	>
		<div class="flex flex-col gap-2">
			<span class={eyebrow}>From Our Events</span>
			<h2 class={headingSection}>Moments worth sharing</h2>
		</div>
		<div
			class="grid grid-cols-2 gap-(--stack-gap-tight) sm:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]"
		>
			{#each tiles as tile, index (tile.id)}
				<button
					type="button"
					onclick={() => (activeIndex = index)}
					aria-label={`View photo ${index + 1} of ${tiles.length}: ${tileAlt(tile, instagramHandle)}`}
					class="overflow-hidden rounded-2xl bg-(--surface-card-raised) shadow-(--shadow-sm) transition-transform duration-(--dur-med) hover:-translate-y-0.5 hover:shadow-(--shadow-md) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
				>
					<img
						src={tile.mediaItems[0].smallUrl}
						alt={tileAlt(tile, instagramHandle)}
						loading="lazy"
						decoding="async"
						class="aspect-square w-full object-cover"
					/>
				</button>
			{/each}
		</div>
		<Button href={resolve('/gallery')} variant="secondary" class="self-center">
			View full gallery
		</Button>
	</div>
</section>

{#if active}
	{#key active.id}
		<dialog
			use:showModal
			aria-label={tileAlt(active, instagramHandle)}
			class="fixed inset-0 m-0 flex h-dvh max-h-none w-dvw max-w-none items-center justify-center overflow-hidden border-0 bg-(--ink-900)/65 p-(--gutter) backdrop:bg-transparent"
			onclick={(event) => {
				if (event.target === event.currentTarget) close();
			}}
			oncancel={(event) => {
				event.preventDefault();
				close();
			}}
		>
			<LightboxCarousel
				tile={active}
				{instagramHandle}
				muted={false}
				onToggleMute={() => {}}
				{loadedIds}
				markLoaded={(id) => loadedIds.add(id)}
				onClose={close}
				onPrev={prev}
				onNext={next}
				onLinkClick={() => track(active.id, 'click')}
			/>
		</dialog>
	{/key}
{/if}
