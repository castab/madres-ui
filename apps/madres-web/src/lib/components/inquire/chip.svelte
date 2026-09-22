<script lang="ts">
	import { cn } from '$lib/utils.js';

	type Props = {
		type: 'radio' | 'checkbox';
		name: string;
		value: string;
		checked: boolean;
		disabled?: boolean;
		label: string;
		description?: string;
		onchange: (checked: boolean) => void;
	};

	let {
		type,
		name,
		value,
		checked,
		disabled = false,
		label,
		description,
		onchange
	}: Props = $props();

	const inputId = $props.id();
	const descriptionId = `${inputId}-desc`;
</script>

<span class="inline-flex">
	<input
		id={inputId}
		{type}
		{name}
		{value}
		{checked}
		disabled={disabled && !checked}
		aria-describedby={description ? descriptionId : undefined}
		onchange={(event) => onchange(event.currentTarget.checked)}
		class="peer sr-only"
	/>
	<label
		for={inputId}
		class={cn(
			'inline-flex cursor-pointer items-center rounded-full border px-4 py-2 font-sans text-(length:--text-body-sm) font-medium transition-colors duration-(--dur-fast)',
			'border-(--border-subtle) bg-(--surface-card-raised) text-(--text-primary)',
			'peer-checked:border-(--brand-primary) peer-checked:bg-(--brand-primary) peer-checked:text-(--text-on-accent)',
			'peer-disabled:cursor-not-allowed peer-disabled:opacity-45',
			'peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--focus-ring) peer-focus-visible:outline-solid'
		)}
	>
		{label}
	</label>
	{#if description}
		<span id={descriptionId} class="sr-only">{description}</span>
	{/if}
</span>
