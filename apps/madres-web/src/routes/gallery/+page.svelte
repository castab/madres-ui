<script lang="ts">
	import GalleryClient from './gallery-client.svelte';
	import { eyebrow, headingDisplay } from '$lib/styles.js';
	import { cn } from '$lib/utils.js';
	import type { PageProps } from './$types.js';

	let { data }: PageProps = $props();

	const instagramHandle = 'madrestacos';
	const instagramUrl = `https://www.instagram.com/${instagramHandle}/`;
</script>

<main>
	<section
		class="mx-auto flex max-w-(--container-narrow) flex-col items-center gap-(--stack-gap) px-(--gutter) py-(--section-y) text-center"
	>
		<span class={eyebrow}>From the Feed</span>
		<h1 class={cn(headingDisplay, 'text-balance')}>A Few Favorites From Recent Events</h1>
		<p
			class="m-0 max-w-(--measure) text-(length:--text-body-lg) leading-(--leading-relaxed) text-(--text-secondary)"
		>
			A curated set from @{instagramHandle} — tap any photo or video to see it larger.
		</p>
		<a
			href={instagramUrl}
			target="_blank"
			rel="noopener"
			class="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-(--brand-primary) px-6 font-sans font-semibold text-(--brand-primary) transition-colors hover:bg-(--brand-primary-tint)"
		>
			Follow @{instagramHandle}
		</a>
	</section>

	{#if data.firstPage.tiles.length > 0}
		<GalleryClient
			initialTiles={data.firstPage.tiles}
			initialHasNextPage={data.firstPage.hasNextPage}
			{instagramHandle}
		/>
	{:else}
		<section class="mx-auto max-w-(--container-narrow) px-(--gutter) pb-(--section-y) text-center">
			<p
				class="m-0 text-(length:--text-body-md) leading-(--leading-relaxed) text-(--text-secondary)"
			>
				New photos and videos are on their way. Follow along on Instagram to see them first.
			</p>
		</section>
	{/if}
</main>
