<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		eyebrow,
		title,
		subtitle,
		footer,
		children,
		...restProps
	}: WithElementRef<WithoutChildren<Omit<HTMLAttributes<HTMLDivElement>, 'title'>>> & {
		eyebrow?: string | Snippet;
		title?: string | Snippet;
		subtitle?: string | Snippet;
		footer?: string | Snippet;
		children?: Snippet;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		'flex flex-col gap-1.5 rounded-2xl border border-(--border-subtle) bg-(--surface-card-raised) p-6 shadow-(--shadow-sm)',
		className
	)}
	{...restProps}
>
	{#if eyebrow}
		<span
			class="font-sans text-(length:--text-overline) font-medium tracking-(--track-wider) text-(--brand-primary) uppercase"
		>
			{#if typeof eyebrow === 'string'}{eyebrow}{:else}{@render eyebrow()}{/if}
		</span>
	{/if}
	{#if title}
		<h3 class="m-0 font-sans text-(length:--text-heading-md) font-semibold text-(--text-primary)">
			{#if typeof title === 'string'}{title}{:else}{@render title()}{/if}
		</h3>
	{/if}
	{#if subtitle}
		<p class="m-0 text-sm text-(--text-secondary)">
			{#if typeof subtitle === 'string'}{subtitle}{:else}{@render subtitle()}{/if}
		</p>
	{/if}
	{@render children?.()}
	{#if footer}
		<div class="mt-2 border-t border-(--border-subtle) pt-3">
			{#if typeof footer === 'string'}{footer}{:else}{@render footer()}{/if}
		</div>
	{/if}
</div>
