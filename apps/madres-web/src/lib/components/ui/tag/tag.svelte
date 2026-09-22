<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<WithoutChildren<HTMLAttributes<HTMLSpanElement>>> & {
		children?: Snippet;
	} = $props();
</script>

<span
	bind:this={ref}
	data-slot="tag"
	class={cn(
		'inline-flex items-center rounded-full border border-(--border-subtle) bg-(--surface-card) px-3.5 py-1.5 font-sans text-sm text-(--text-primary)',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>
