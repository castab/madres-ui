<script lang="ts">
	import { formatCents } from '$lib/offering/money.js';
	import type { Category } from '$lib/offering/types.js';
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

	function chipLabel(priceCents: number, label: string): string {
		if (priceCents === 0) return label;
		const amount = formatCents(priceCents, currency);
		return category.pricingType === 'PER_GUEST'
			? `${label} · +${amount}/guest`
			: `${label} · +${amount}`;
	}
</script>

<ChipGroupShell legend={category.label} {error}>
	{#each category.options as option (option.id)}
		<Chip
			type="radio"
			name={categoryKey}
			value={option.id}
			checked={value === option.id}
			label={chipLabel(option.priceCents, option.label)}
			description={option.description}
			onchange={() => onChange(option.id)}
		/>
	{/each}
</ChipGroupShell>
