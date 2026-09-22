<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { cn, type WithoutChildren } from '$lib/utils.js';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	const instagramUrl = 'https://www.instagram.com/madrestacos/';

	// Fixed so repeat clicks update the same toast in place (resetting its
	// auto-dismiss timer) instead of stacking a new one per click.
	const comingSoonToastId = 'coming-soon-booking';

	let {
		class: className,
		children,
		...restProps
	}: WithoutChildren<HTMLButtonAttributes> & { children: Snippet } = $props();

	function handleClick() {
		toast('Online booking is coming soon', {
			id: comingSoonToastId,
			description: 'Thank you for your patience — follow along on Instagram for updates.',
			duration: 9000,
			action: {
				label: 'Follow on Instagram',
				onClick: () => window.open(instagramUrl, '_blank', 'noopener')
			}
		});
	}
</script>

<button
	type="button"
	aria-disabled="true"
	onclick={handleClick}
	class={cn('cursor-not-allowed opacity-45', className)}
	{...restProps}
>
	{@render children()}
</button>
