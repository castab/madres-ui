<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';

	type Props = {
		type: 'radio' | 'checkbox';
		name: string;
		value: string;
		checked: boolean;
		disabled?: boolean;
		label: string;
		priceLabel?: string;
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
		priceLabel,
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
	<span
		class={cn(
			'relative inline-flex items-center rounded-full border px-4 py-2 font-sans text-(length:--text-body-sm) font-medium transition-colors duration-(--dur-fast)',
			'border-(--border-subtle) bg-(--surface-card-raised) text-(--text-primary)',
			'peer-checked:border-(--brand-primary) peer-checked:bg-(--brand-primary) peer-checked:text-(--text-on-accent)',
			'peer-disabled:opacity-45 peer-disabled:[&_label]:cursor-not-allowed',
			'peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--focus-ring) peer-focus-visible:outline-solid'
		)}
	>
		<label for={inputId} class="absolute inset-0 cursor-pointer rounded-full">
			<span class="sr-only">{label}{priceLabel}</span>
		</label>
		<span aria-hidden="true">{label}</span>
		{#if description}
			<Popover.Root>
				<Popover.Trigger
					type="button"
					aria-label={`More about ${label}`}
					class="relative ml-1 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full align-middle focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
				>
					<InfoIcon class="size-3.5" aria-hidden="true" />
				</Popover.Trigger>
				<Popover.Content class="w-64 max-w-[calc(100vw-2rem)] p-3 leading-relaxed">
					{description}
				</Popover.Content>
			</Popover.Root>
		{/if}
		{#if priceLabel}
			<span aria-hidden="true">{priceLabel}</span>
		{/if}
	</span>
	{#if description}
		<span id={descriptionId} class="sr-only">{description}</span>
	{/if}
</span>
