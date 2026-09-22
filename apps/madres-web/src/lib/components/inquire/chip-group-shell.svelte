<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	type Props = {
		legend: string;
		counter?: string;
		error?: string;
		children: Snippet;
	};

	let { legend, counter, error, children }: Props = $props();
</script>

<fieldset
	class="m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0"
	data-invalid={error ? 'true' : undefined}
>
	<legend class="m-0 mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 p-0">
		<span
			class={cn(
				'font-sans text-(length:--text-caption) font-medium tracking-(--track-wide) uppercase',
				error ? 'text-(--state-danger)' : 'text-(--text-secondary)'
			)}
		>
			{legend}
		</span>
		{#if counter}
			<span class="text-(length:--text-caption) text-(--text-muted)">{counter}</span>
		{/if}
	</legend>
	<div class="flex flex-wrap gap-2.5">
		{@render children()}
	</div>
	{#if error}
		<p class="m-0 text-(length:--text-caption) text-(--state-danger)">{error}</p>
	{/if}
</fieldset>
