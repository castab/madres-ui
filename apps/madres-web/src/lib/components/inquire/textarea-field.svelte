<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { focusRing } from '$lib/styles.js';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type Props = WithElementRef<Omit<HTMLTextareaAttributes, 'id' | 'value'>> & {
		id: string;
		label: string;
		value?: string;
		helperText?: string;
		error?: string;
	};

	let {
		id,
		label,
		helperText,
		error,
		class: className,
		ref = $bindable(null),
		value = $bindable(''),
		...restProps
	}: Props = $props();
</script>

<label for={id} class="flex w-full flex-col gap-1.5 font-sans">
	<span
		class="text-(length:--text-caption) font-medium tracking-(--track-wide) text-(--text-secondary) uppercase"
	>
		{label}
	</span>
	<textarea
		bind:this={ref}
		bind:value
		{id}
		rows="4"
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
		class={cn(
			'w-full resize-y rounded-(--radius-sm) border bg-(--surface-card-raised) px-3.5 py-2.5 text-(length:--text-body-md) text-(--text-primary) placeholder:text-(--text-muted)',
			error ? 'border-(--state-danger)' : 'border-(--border-subtle)',
			focusRing,
			className
		)}
		{...restProps}></textarea>
	{#if error}
		<span id="{id}-error" class="text-(length:--text-caption) text-(--state-danger)">{error}</span>
	{:else if helperText}
		<span id="{id}-helper" class="text-(length:--text-caption) text-(--text-muted)"
			>{helperText}</span
		>
	{/if}
</label>
