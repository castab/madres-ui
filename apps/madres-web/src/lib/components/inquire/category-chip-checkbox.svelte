<script lang="ts">
	import { formatCents } from '$lib/offering/money.js';
	import type { Category } from '$lib/offering/types.js';
	import Chip from './chip.svelte';
	import ChipGroupShell from './chip-group-shell.svelte';

	type Props = {
		category: Category;
		categoryKey: string;
		currency: string;
		isSelected: (optionId: string) => boolean;
		selectionCount: number;
		error?: string;
		onToggle: (optionId: string) => void;
	};

	let { category, categoryKey, currency, isSelected, selectionCount, error, onToggle }: Props =
		$props();

	function priceLabel(priceCents: number): string {
		if (priceCents === 0) return '';
		const amount = formatCents(priceCents, currency);
		return category.pricingType === 'PER_GUEST' ? ` · +${amount}/guest` : ` · +${amount}`;
	}

	const counter = $derived.by(() => {
		const base = `${selectionCount} of ${category.maxSelections} picked`;
		const included = category.selectionPricing?.includedSelections;
		return included ? `${base} · ${included} included` : base;
	});
</script>

<ChipGroupShell legend={category.label} {counter} {error}>
	{#each category.options as option (option.id)}
		{@const checked = isSelected(option.id)}
		<Chip
			type="checkbox"
			name={categoryKey}
			value={option.id}
			{checked}
			disabled={!checked && selectionCount >= category.maxSelections}
			label={option.label}
			priceLabel={priceLabel(option.priceCents)}
			description={option.description}
			onchange={() => onToggle(option.id)}
		/>
	{/each}
</ChipGroupShell>
