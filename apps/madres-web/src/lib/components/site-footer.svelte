<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import BrandMark from './brand-mark.svelte';
	import ComingSoonButton from './coming-soon-button.svelte';

	const instagramProfileUrl = 'https://www.instagram.com/madrestacos/';

	// The landing page's footer "Instagram" label links to the in-app gallery;
	// the gallery page's own footer links out to the real profile instead.
	const isExternal = $derived(page.url.pathname === '/gallery');
</script>

<footer class="bg-(--brand-primary) text-(--text-on-accent)">
	<div
		class="mx-auto flex max-w-(--container-max) flex-col items-center gap-4 px-(--gutter) py-10 text-center md:flex-row md:justify-between md:text-left"
	>
		<BrandMark variant="white" />
		<p class="m-0 opacity-70">© 2026 Madres Taco Shop. Luxury, from a truck.</p>
		<nav
			aria-label="Footer navigation"
			class="flex flex-wrap justify-center gap-x-5 gap-y-2 font-sans text-sm opacity-85 md:justify-end"
		>
			<a href={resolve('/#how')}>Catering</a>
			<ComingSoonButton>Contact</ComingSoonButton>
			{#if isExternal}
				<a href={instagramProfileUrl} target="_blank" rel="noopener">Instagram</a>
			{:else}
				<a href={resolve('/gallery')}>Instagram</a>
			{/if}
		</nav>
	</div>
</footer>
