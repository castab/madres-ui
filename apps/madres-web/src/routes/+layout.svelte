<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteHeader from '$lib/components/site-header.svelte';
	import SiteFooter from '$lib/components/site-footer.svelte';
	import Toaster from '$lib/components/ui/sonner/sonner.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Madres Taco Shop</title>
	<meta
		name="description"
		content="Fine dining, catered to you — hand-seared tacos and a styled table, brought to your private event by Madres Taco Shop."
	/>
</svelte:head>

<div class="flex min-h-dvh flex-col antialiased">
	<a
		class="fixed top-3 left-3 z-20 -translate-y-24 rounded-md bg-(--surface-inverse) px-4 py-3 text-(--text-on-inverse) focus:translate-y-0"
		href="#main-content">Skip to content</a
	>
	<SiteHeader />
	<div id="main-content" class="flex flex-1 flex-col">
		{@render children()}
	</div>
	<SiteFooter />
</div>

<Toaster />
