<script lang="ts">
	import { cn, type WithoutChildren } from '$lib/utils.js';
	import { showComingSoonToast } from '$lib/toast/coming-soon-toast-state.svelte.js';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	const instagramUrl = 'https://www.instagram.com/madrestacos/';

	let {
		class: className,
		children,
		...restProps
	}: WithoutChildren<HTMLButtonAttributes> & { children: Snippet } = $props();

	function handleClick() {
		showComingSoonToast({
			title: 'Online booking is coming soon',
			description: 'Thank you for your patience — follow along on Instagram for updates.',
			actionLabel: 'Follow on Instagram',
			onAction: () => window.open(instagramUrl, '_blank', 'noopener'),
			timeoutMs: 9000
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
