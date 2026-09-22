<script lang="ts">
	import type { GalleryTile } from '$lib/server/presentation-service/gallery.server.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import {
		CloseIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		PlayIcon,
		PauseIcon,
		MutedIcon,
		UnmutedIcon
	} from '$lib/components/icons/index.js';
	import { cn } from '$lib/utils.js';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		tileAlt,
		isPlayableItem,
		aspectRatioFor,
		isInteractiveDialogElement,
		formatDuration,
		SWIPE_THRESHOLD_PX
	} from './gallery-helpers.js';

	let {
		tile,
		instagramHandle,
		muted,
		onToggleMute,
		loadedIds,
		markLoaded,
		onClose,
		onPrev,
		onNext,
		onLinkClick
	}: {
		tile: GalleryTile;
		instagramHandle: string;
		muted: boolean;
		onToggleMute: () => void;
		loadedIds: Set<string>;
		markLoaded: (id: string) => void;
		onClose: () => void;
		onPrev: () => void;
		onNext: () => void;
		onLinkClick: () => void;
	} = $props();

	let carouselIndex = $state(0);
	let carouselScrollRef: HTMLDivElement | undefined = $state();
	const videoRefs = new SvelteMap<number, HTMLVideoElement>();
	let playback = $state({ currentTime: 0, duration: 0, isPlaying: false });

	function videoRefAction(node: HTMLVideoElement, index: number) {
		videoRefs.set(index, node);
		return {
			destroy() {
				videoRefs.delete(index);
			}
		};
	}

	// Only the current slide is ever told to play — a warmed neighbor's <video> is mounted
	// for preloading only and never receives a play() call, so this alone guarantees at most
	// one video plays at a time. This effect also mirrors the current slide's real playback
	// state (position/duration/playing) into `playback` for the controls bar below —
	// listeners are attached here rather than as template props on every warmed <video>,
	// because a warmed neighbor's loadedmetadata/durationchange can fire before it ever
	// becomes current, which a listener added only once an element is "current" would miss.
	$effect(() => {
		const el = videoRefs.get(carouselIndex);
		if (!el) {
			playback = { currentTime: 0, duration: 0, isPlaying: false };
			return;
		}
		const sync = () =>
			(playback = {
				currentTime: el.currentTime,
				duration: Number.isFinite(el.duration) ? el.duration : 0,
				isPlaying: !el.paused
			});
		sync();
		el.addEventListener('timeupdate', sync);
		el.addEventListener('loadedmetadata', sync);
		el.addEventListener('durationchange', sync);
		el.addEventListener('play', sync);
		el.addEventListener('pause', sync);
		void el.play().catch(() => {});
		return () => {
			el.removeEventListener('timeupdate', sync);
			el.removeEventListener('loadedmetadata', sync);
			el.removeEventListener('durationchange', sync);
			el.removeEventListener('play', sync);
			el.removeEventListener('pause', sync);
			el.pause();
		};
	});

	function togglePlayback() {
		const el = videoRefs.get(carouselIndex);
		if (!el) return;
		if (el.paused) void el.play().catch(() => {});
		else el.pause();
	}

	function onScrub(event: Event) {
		const el = videoRefs.get(carouselIndex);
		if (!el) return;
		const value = Number((event.currentTarget as HTMLInputElement).value);
		el.currentTime = value;
		playback = { ...playback, currentTime: value };
	}

	function goToSlide(index: number) {
		const el = carouselScrollRef;
		if (!el || el.clientWidth === 0) return;
		el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
	}

	function onCarouselScroll(event: Event) {
		const el = event.currentTarget as HTMLDivElement;
		if (el.clientWidth === 0) return;
		const index = Math.round(el.scrollLeft / el.clientWidth);
		if (carouselIndex !== index) carouselIndex = index;
	}

	/**
	 * The Previous/Next chevrons (and the ArrowLeft/ArrowRight keys below, their keyboard
	 * equivalent) page between posts by default, but a carousel must be traversed first: at
	 * any slide short of the boundary in that direction, they move within the carousel
	 * instead. This gives desktop/no-touch users the same "swipe through the carousel, then
	 * land on the next post" path touch users already get from the swipe gesture.
	 */
	function handlePrev() {
		if (carouselIndex > 0) goToSlide(carouselIndex - 1);
		else onPrev();
	}

	function handleNext() {
		if (carouselIndex < tile.mediaItems.length - 1) goToSlide(carouselIndex + 1);
		else onNext();
	}

	$effect(() => {
		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape') onClose();
			else if (event.key === 'ArrowLeft') handlePrev();
			else if (event.key === 'ArrowRight') handleNext();
			else if (event.key === ' ') {
				const item = tile.mediaItems[carouselIndex];
				if (!item || !isPlayableItem(item) || isInteractiveDialogElement(event.target)) return;
				event.preventDefault();
				togglePlayback();
			}
		}
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	});

	/**
	 * A touch swipe moves between posts only once the carousel itself has nowhere left to
	 * scroll in that direction — a single-item post has no scroll room either way, so it
	 * swipes straight to the next/previous post. This is checked at touchstart (not touchend)
	 * because the carousel's own scroll-snap settle is asynchronous after a touch lifts, so the
	 * boundary at touchend may not yet reflect where this particular gesture started.
	 */
	let touchStart: { x: number; y: number; atStart: boolean; atEnd: boolean } | null = null;

	function onTouchStart(event: TouchEvent) {
		const el = event.currentTarget as HTMLDivElement;
		const touch = event.touches[0];
		if (!touch) return;
		const maxScrollLeft = el.scrollWidth - el.clientWidth;
		touchStart = {
			x: touch.clientX,
			y: touch.clientY,
			atStart: el.scrollLeft <= 1,
			atEnd: el.scrollLeft >= maxScrollLeft - 1
		};
	}

	function onTouchEnd(event: TouchEvent) {
		const start = touchStart;
		touchStart = null;
		const touch = event.changedTouches[0];
		if (!start || !touch) return;

		const deltaX = touch.clientX - start.x;
		const deltaY = touch.clientY - start.y;
		if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) < Math.abs(deltaY)) return;

		if (deltaX < 0 && start.atEnd) onNext();
		else if (deltaX > 0 && start.atStart) onPrev();
	}

	const currentItem = $derived(tile.mediaItems[carouselIndex]);
	const showSpinner = $derived(!loadedIds.has(`${tile.id}:${carouselIndex}`));
	const slideIndices = $derived(tile.mediaItems.map((_, i) => i));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative flex max-h-[90dvh] w-[min(480px,100%)] flex-col overflow-y-auto rounded-2xl bg-(--surface-card-raised) shadow-(--shadow-lg)"
	onclick={(event) => event.stopPropagation()}
>
	<div
		class="relative shrink-0 overflow-hidden rounded-t-2xl bg-(--surface-sunken)"
		style="aspect-ratio: {currentItem ? aspectRatioFor(currentItem) : 1}"
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={carouselScrollRef}
			onscroll={onCarouselScroll}
			ontouchstart={onTouchStart}
			ontouchend={onTouchEnd}
			class="flex h-full w-full snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
		>
			{#each tile.mediaItems as item, i (i)}
				{@const slideAlt =
					tile.mediaItems.length > 1
						? `${tileAlt(tile, instagramHandle)} — image ${i + 1} of ${tile.mediaItems.length}`
						: tileAlt(tile, instagramHandle)}
				{@const isWarmed = isPlayableItem(item) && Math.abs(i - carouselIndex) <= 1}
				<div class="h-full w-full shrink-0 snap-center">
					{#if isWarmed}
						<video
							use:videoRefAction={i}
							src={item.videoUrl ?? undefined}
							poster={item.largeUrl}
							preload="auto"
							loop
							playsinline
							muted={i === carouselIndex ? muted : true}
							onloadeddata={() => markLoaded(`${tile.id}:${i}`)}
							class="h-full w-full object-contain"
						></video>
					{:else}
						<img
							src={item.largeUrl}
							alt={slideAlt}
							onload={() => markLoaded(`${tile.id}:${i}`)}
							class="h-full w-full object-contain"
						/>
					{/if}
				</div>
			{/each}
		</div>
		{#if showSpinner}
			<div class="absolute inset-0 flex items-center justify-center bg-(--surface-sunken)">
				<div
					role="status"
					class="size-9 animate-spin rounded-full border-[3px] border-(--brand-primary)/25 border-t-(--brand-primary) motion-safe:animate-spin"
				>
					<span class="sr-only">
						Loading {currentItem && isPlayableItem(currentItem) ? 'video' : 'photo'}…
					</span>
				</div>
			</div>
		{/if}
		<button
			type="button"
			onclick={onClose}
			aria-label="Close"
			class="absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-full bg-(--ink-900)/55 text-(--talavera-white) hover:brightness-110"
		>
			<CloseIcon />
		</button>
		<button
			type="button"
			onclick={handlePrev}
			aria-label="Previous"
			class="absolute top-1/2 left-3 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-(--ink-900)/55 text-(--talavera-white) hover:brightness-110"
		>
			<ChevronLeftIcon />
		</button>
		<button
			type="button"
			onclick={handleNext}
			aria-label="Next"
			class="absolute top-1/2 right-3 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-(--ink-900)/55 text-(--talavera-white) hover:brightness-110"
		>
			<ChevronRightIcon />
		</button>
		{#if currentItem && isPlayableItem(currentItem)}
			<div
				class="absolute inset-x-3 bottom-3 z-10 flex items-center gap-2 rounded-full bg-(--ink-900)/55 px-3 py-2 text-(--talavera-white)"
			>
				<button
					type="button"
					onclick={togglePlayback}
					aria-label={playback.isPlaying ? 'Pause video' : 'Play video'}
					class="grid size-7 shrink-0 place-items-center hover:brightness-110"
				>
					{#if playback.isPlaying}
						<PauseIcon size={16} />
					{:else}
						<PlayIcon size={16} />
					{/if}
				</button>
				<input
					type="range"
					min="0"
					max={playback.duration || 0}
					step="0.1"
					value={playback.currentTime}
					oninput={onScrub}
					disabled={playback.duration === 0}
					aria-label="Seek video"
					aria-valuetext={`${formatDuration(playback.currentTime)} of ${formatDuration(playback.duration)}`}
					class="h-1 min-w-0 flex-1 accent-(--brand-primary)"
				/>
				<span class="shrink-0 text-xs tabular-nums">
					{formatDuration(playback.currentTime)}/{formatDuration(playback.duration)}
				</span>
				<button
					type="button"
					onclick={onToggleMute}
					aria-label={muted ? 'Unmute video' : 'Mute video'}
					class="grid size-7 shrink-0 place-items-center hover:brightness-110"
				>
					{#if muted}
						<MutedIcon size={16} />
					{:else}
						<UnmutedIcon size={16} />
					{/if}
				</button>
			</div>
		{/if}
	</div>
	{#if tile.mediaItems.length > 1}
		<div
			class="flex items-center justify-center gap-1.5 py-3"
			role="group"
			aria-label="Carousel position"
		>
			{#each slideIndices as i (i)}
				<button
					type="button"
					onclick={() => goToSlide(i)}
					aria-label={`Go to image ${i + 1} of ${tile.mediaItems.length}`}
					aria-current={i === carouselIndex ? 'true' : undefined}
					class={cn(
						'size-1.5 rounded-full transition-colors duration-(--dur-fast)',
						i === carouselIndex ? 'bg-(--brand-primary)' : 'bg-(--border-subtle)'
					)}
				></button>
			{/each}
		</div>
	{/if}
	<div class="flex flex-col gap-3 p-5">
		{#if currentItem && currentItem.mediaType === 'VIDEO'}
			<Badge tone="accent">{isPlayableItem(currentItem) ? 'Video' : 'Video · Processing'}</Badge>
		{/if}
		<p class="m-0 text-(length:--text-body-md) leading-(--leading-relaxed) text-(--text-primary)">
			{tileAlt(tile, instagramHandle)}
		</p>
		<!-- eslint-disable svelte/no-navigation-without-resolve -- tile.permalink is always an external instagram.com URL from the presentation-service API -->
		<a
			href={tile.permalink}
			target="_blank"
			rel="noopener"
			onclick={onLinkClick}
			class={cn(
				'w-fit text-sm font-semibold text-(--brand-primary) underline-offset-4 hover:underline'
			)}
		>
			View on Instagram
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
</div>
