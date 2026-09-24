<script lang="ts">
	import { formatCents } from '$lib/offering/money.js';
	import type { Category, Option } from '$lib/offering/types.js';
	import Chip from './chip.svelte';
	import ChipGroupShell from './chip-group-shell.svelte';

	type Props = {
		category: Category;
		categoryKey: string;
		currency: string;
		value: string | undefined;
		error?: string;
		onChange: (optionId: string) => void;
	};

	let { category, categoryKey, currency, value, error, onChange }: Props = $props();

	function priceLabel(option: Option): string {
		const priceLabel =
			option.priceCents === 0
				? ''
				: option.minimumEventCents !== undefined
					? ` · ${formatCents(option.priceCents, currency)}/guest`
					: category.pricingType === 'PER_GUEST'
						? ` · +${formatCents(option.priceCents, currency)}/guest`
						: ` · +${formatCents(option.priceCents, currency)}`;
		const minimumLabel =
			option.minimumEventCents === undefined
				? ''
				: ` · ${formatCents(option.minimumEventCents, currency)} event minimum`;
		return `${priceLabel}${minimumLabel}`;
	}
</script>

<ChipGroupShell legend={category.label} {error}>
	{#each category.options as option (option.id)}
		<Chip
			type="radio"
			name={categoryKey}
			value={option.id}
			checked={value === option.id}
			label={option.label}
			priceLabel={priceLabel(option)}
			description={option.description}
			onchange={() => onChange(option.id)}
		/>
	{/each}
</ChipGroupShell>
