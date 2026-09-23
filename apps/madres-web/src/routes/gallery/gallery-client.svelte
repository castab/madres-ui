<script lang="ts">
	import { untrack } from 'svelte';
	import type {
		GalleryPage,
		GalleryTile
	} from '$lib/server/presentation-service/gallery.server.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { PlayIcon, StackedLayersIcon } from '$lib/components/icons/index.js';
	import LightboxCarousel from './lightbox-carousel.svelte';
	import { tileAlt, mediaTypeWord, truncateCaption } from './gallery-helpers.js';
	import { SvelteSet } from 'svelte/reactivity';

	let {
		initialTiles,
		initialHasNextPage,
		instagramHandle
	}: {
		initialTiles: GalleryTile[];
		initialHasNextPage: boolean;
		instagramHandle: string;
	} = $props();

	// Seeded once from the server-rendered first page, then diverges as loadMore() appends
	// pages — untrack() tells Svelte this one-time read is deliberate, not a missed binding.
	let tiles = $state(untrack(() => initialTiles));
	let hasNextPage = $state(untrack(() => initialHasNextPage));
	let isLoadingMore = $state(false);
	let loadMoreError = $state(false);
	let nextPage = 2;
	let endOfGalleryRef: HTMLParagraphElement | undefined = $state();
	let activeIndex = $state(-1);
	let muted = $state(false);
	// SvelteSet, not `$state(new Set())`: $state only makes reassignment of the variable
	// reactive, not in-place mutation of a plain Set's internal slots — .add() calls on a
	// `$state`-wrapped Set silently don't trigger a re-render, leaving every `.has()` read
	// (e.g. the loading-spinner check below) permanently stuck at its first value.
	const loadedIds = new SvelteSet<string>();
	const loadedThumbnailIds = new SvelteSet<string>();
	const trackedViewIds = new SvelteSet<string>();
	const warmedMediaUrls = new SvelteSet<string>();
	let warmedMediaElements: HTMLImageElement[] = [];

	const hasActive = $derived(activeIndex > -1);
	const active = $derived(hasActive ? tiles[activeIndex] : null);

	async function trackView(id: string) {
		await fetch('/gallery/track', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ id, event: 'view' }),
			keepalive: true
		}).catch(() => {});
	}

	function trackClick(id: string) {
		void fetch('/gallery/track', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ id, event: 'click' }),
			keepalive: true
		}).catch(() => {});
	}

	async function loadMore() {
		isLoadingMore = true;
		loadMoreError = false;
		try {
			const response = await fetch(`/gallery/load-more?page=${nextPage}`);
			if (!response.ok) throw new Error('Gallery request failed');
			const page: GalleryPage = await response.json();
			if (
				!Array.isArray(page.tiles) ||
				typeof page.hasNextPage !== 'boolean' ||
				page.currentPage !== nextPage
			) {
				throw new Error('Invalid gallery response');
			}
			tiles.push(...page.tiles);
			hasNextPage = page.hasNextPage;
			nextPage += 1;
			if (!page.hasNextPage) endOfGalleryRef?.focus();
		} catch {
			loadMoreError = true;
		} finally {
			isLoadingMore = false;
		}
	}

	function markLoaded(id: string) {
		loadedIds.add(id);
	}

	function markThumbnailLoaded(id: string) {
		loadedThumbnailIds.add(id);
	}

	function close() {
		activeIndex = -1;
	}
	function prev() {
		activeIndex = (activeIndex - 1 + tiles.length) % tiles.length;
	}
	function next() {
		activeIndex = (activeIndex + 1) % tiles.length;
	}

	// This tile is server-rendered, so the browser can start (and finish) loading it before
	// hydration attaches onload below — in which case the load event already fired and would
	// otherwise never be seen, leaving the spinner stuck forever. `complete` catches that case
	// (also true after a failed load, which should stop the spinner too).
	function checkThumbnailComplete(node: HTMLImageElement, id: string) {
		if (node.complete) markThumbnailLoaded(id);
	}

	$effect(() => {
		if (!active || trackedViewIds.has(active.id)) return;
		trackedViewIds.add(active.id);
		void trackView(active.id);
	});

	// The lightbox deliberately renders just one post, so the browser otherwise has no reason
	// to request the large poster/photo for the post a visitor is most likely to view next.
	// Warm the entry slide for both adjacent posts while a post is open. Retaining these Image
	// objects matters because an unreferenced image may be collected and abort its request
	// before it reaches the cache.
	$effect(() => {
		if (!active || tiles.length < 2) return;

		const neighborIndices = [
			...new Set([
				(activeIndex - 1 + tiles.length) % tiles.length,
				(activeIndex + 1) % tiles.length
			])
		];
		for (const index of neighborIndices) {
			const item = tiles[index]?.mediaItems[0];
			if (!item) continue;

			const url = item.largeUrl;
			if (warmedMediaUrls.has(url)) continue;
			warmedMediaUrls.add(url);

			const image = new Image();
			image.decoding = 'async';
			image.src = item.largeUrl;
			warmedMediaElements.push(image);
		}
	});

	// Release our references after closing. Completed image responses remain in the browser
	// cache; an unfinished low-priority warm can be abandoned instead of outliving the dialog.
	$effect(() => {
		if (active) return;
		warmedMediaElements = [];
		warmedMediaUrls.clear();
	});
</script>

<section
	class="mx-auto grid max-w-(--container-max) grid-cols-2 gap-(--stack-gap-tight) px-(--gutter) pb-(--section-y) sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]"
>
	{#each tiles as tile, index (tile.id)}
		<button
			type="button"
			onclick={() => (activeIndex = index)}
			aria-label={`View ${mediaTypeWord(tile.mediaType)} ${index + 1} of ${tiles.length}: ${tileAlt(tile, instagramHandle)}`}
			class="flex flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card-raised) text-left shadow-(--shadow-sm) transition-transform duration-(--dur-med) hover:-translate-y-0.5 hover:shadow-(--shadow-md) focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
		>
			<div class="relative aspect-square overflow-hidden bg-(--surface-sunken)">
				<img
					use:checkThumbnailComplete={tile.id}
					src={tile.mediaItems[0].smallUrl}
					alt={tileAlt(tile, instagramHandle)}
					loading="lazy"
					decoding="async"
					onload={() => markThumbnailLoaded(tile.id)}
					onerror={() => markThumbnailLoaded(tile.id)}
					class="absolute inset-0 h-full w-full object-cover"
				/>
				{#if tile.mediaType === 'VIDEO' && loadedThumbnailIds.has(tile.id)}
					<div
						class="absolute inset-0 flex items-center justify-center text-(--talavera-white) drop-shadow"
					>
						<PlayIcon />
					</div>
				{/if}
				{#if tile.mediaType === 'CAROUSEL_ALBUM' && loadedThumbnailIds.has(tile.id)}
					<div class="absolute top-2 right-2 text-(--talavera-white) drop-shadow">
						<StackedLayersIcon size={18} />
					</div>
				{/if}
				{#if !loadedThumbnailIds.has(tile.id)}
					<div class="absolute inset-0 flex items-center justify-center bg-(--surface-sunken)">
						<div
							role="status"
							class="size-8 animate-spin rounded-full border-[3px] border-(--brand-primary)/25 border-t-(--brand-primary) motion-safe:animate-spin"
						>
							<span class="sr-only">
								Loading {tile.mediaType === 'VIDEO' ? 'video' : 'photo'}…
							</span>
						</div>
					</div>
				{/if}
			</div>
			<p class="m-0 px-4 py-3 text-sm leading-(--leading-relaxed) text-(--text-secondary)">
				{tile.caption ? truncateCaption(tile.caption) : `A moment from @${instagramHandle}`}
			</p>
		</button>
	{/each}
</section>

<div class="mx-auto flex max-w-(--container-max) justify-center px-(--gutter) pb-(--section-y)">
	{#if hasNextPage}
		<div class="flex flex-col items-center gap-3">
			<Button variant="secondary" onclick={() => void loadMore()} disabled={isLoadingMore}>
				{isLoadingMore ? 'Loading…' : 'Load more'}
			</Button>
			{#if loadMoreError}
				<p role="alert" class="m-0 text-sm text-(--state-danger)">
					Couldn't load more photos. Please try again.
				</p>
			{/if}
		</div>
	{:else}
		<p
			bind:this={endOfGalleryRef}
			tabindex="-1"
			role="status"
			class="m-0 text-sm text-(--text-secondary) outline-none"
		>
			You're all caught up.
		</p>
	{/if}
</div>

{#if active}
	{#key active.id}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div
			role="dialog"
			aria-modal="true"
			aria-label={tileAlt(active, instagramHandle)}
			class="fixed inset-0 z-[1000] flex items-center justify-center bg-(--ink-900)/65 p-(--gutter)"
			onclick={close}
		>
			<LightboxCarousel
				tile={active}
				{instagramHandle}
				{muted}
				onToggleMute={() => (muted = !muted)}
				{loadedIds}
				{markLoaded}
				onClose={close}
				onPrev={prev}
				onNext={next}
				onLinkClick={() => trackClick(active.id)}
			/>
		</div>
	{/key}
{/if}
