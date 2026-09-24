<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { formatCents } from '$lib/offering/money.js';
	import type { Category } from '$lib/offering/types.js';
	import { focusRing } from '$lib/styles.js';
	import { cn } from '$lib/utils.js';

	type Props = {
		category: Category;
		categoryKey: string;
		currency: string;
		quantityValue: (optionId: string) => string;
		onQuantityChange: (optionId: string, raw: string) => void;
		subtotalCents: number;
		selectedOptions: number;
		error?: string;
	};

	let {
		category,
		categoryKey,
		currency,
		quantityValue,
		onQuantityChange,
		subtotalCents,
		selectedOptions,
		error
	}: Props = $props();

	let minimumLabel = $derived(formatCents(category.minimumOrderCents ?? 0, currency));
</script>

<fieldset
	class="m-0 flex min-w-0 flex-col gap-3 border-0 p-0"
	data-invalid={error ? 'true' : undefined}
>
	<legend
		class={cn(
			'm-0 mb-1 font-sans text-(length:--text-caption) font-medium tracking-(--track-wide) uppercase',
			error ? 'text-(--state-danger)' : 'text-(--text-secondary)'
		)}
	>
		{category.label}
	</legend>
	<p class="m-0 text-(length:--text-body-sm) text-(--text-secondary)">
		Optional. Enter the quantity of each item you want. If you order appetizers, the combined
		subtotal must reach {minimumLabel}.
	</p>
	<div class="grid gap-3 sm:grid-cols-2">
		{#each category.options as option (option.id)}
			{@const inputId = `${categoryKey}-${option.id}-quantity`}
			<div
				class="flex flex-col gap-2 rounded-(--radius-md) border border-(--border-subtle) bg-(--surface-card-raised) p-3"
			>
				<div class="flex items-center gap-1.5">
					<label
						for={inputId}
						class="font-sans text-(length:--text-body-sm) font-medium text-(--text-primary)"
					>
						{option.label}
					</label>
					{#if option.description}
						<Popover.Root>
							<Popover.Trigger
								type="button"
								aria-label={`More about ${option.label}`}
								class="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
							>
								<InfoIcon class="size-3.5" aria-hidden="true" />
							</Popover.Trigger>
							<Popover.Content class="w-64 max-w-[calc(100vw-2rem)] p-3 leading-relaxed">
								{option.description}
							</Popover.Content>
						</Popover.Root>
					{/if}
					<span
						class="ml-auto text-(length:--text-body-sm) whitespace-nowrap text-(--text-secondary)"
					>
						{formatCents(option.priceCents, currency)} each
					</span>
				</div>
				<input
					id={inputId}
					name={`${categoryKey}:${option.id}`}
					type="number"
					inputmode="numeric"
					min="0"
					max={category.maximumQuantityPerOption}
					step="1"
					placeholder="0"
					value={quantityValue(option.id)}
					oninput={(event) => onQuantityChange(option.id, event.currentTarget.value)}
					aria-label={`Quantity of ${option.label}`}
					aria-invalid={error ? 'true' : undefined}
					class={cn(
						'min-h-11 w-28 rounded-(--radius-sm) border bg-(--surface-card-raised) px-3 py-2 text-(length:--text-body-md) text-(--text-primary)',
						error ? 'border-(--state-danger)' : 'border-(--border-subtle)',
						focusRing
					)}
				/>
			</div>
		{/each}
	</div>
	<p class="m-0 text-(length:--text-body-sm) text-(--text-secondary)">
		{#if selectedOptions === 0}
			No appetizers selected.
		{:else}
			Appetizer subtotal: {formatCents(subtotalCents, currency)}
			{#if subtotalCents < (category.minimumOrderCents ?? 0)}
				· {formatCents((category.minimumOrderCents ?? 0) - subtotalCents, currency)} more to reach the
				minimum
			{/if}
		{/if}
	</p>
	{#if error}
		<p class="m-0 text-(length:--text-caption) text-(--state-danger)" role="alert">{error}</p>
	{/if}
</fieldset>
