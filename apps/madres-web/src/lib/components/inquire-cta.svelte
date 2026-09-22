<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ComingSoonButton from './coming-soon-button.svelte';
	import type { WithoutChildren } from '$lib/utils.js';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		class: className,
		children,
		...restProps
	}: WithoutChildren<HTMLAnchorAttributes> & { children: Snippet } = $props();
</script>

{#if page.data.offeringAvailable}
	<a href={resolve('/inquire')} class={className} {...restProps}>
		{@render children()}
	</a>
{:else}
	<ComingSoonButton class={className}>
		{@render children()}
	</ComingSoonButton>
{/if}
