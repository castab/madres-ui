<script lang="ts">
	import type { Category } from '$lib/offering/types.js';
	import CategoryChipRadio from './category-chip-radio.svelte';
	import CategoryChipCheckbox from './category-chip-checkbox.svelte';
	import CategoryQuantityList from './category-quantity-list.svelte';

	type Props = {
		category: Category;
		categoryKey: string;
		currency: string;
		isSelected: (optionId: string) => boolean;
		selectedOption: string | undefined;
		selectionCount: number;
		error?: string;
		onSelectSingle: (optionId: string) => void;
		onToggleMulti: (optionId: string) => void;
		quantityValue: (optionId: string) => string;
		onQuantityChange: (optionId: string, raw: string) => void;
		quantitySubtotalCents: number;
		quantitySelectedOptions: number;
	};

	let {
		category,
		categoryKey,
		currency,
		isSelected,
		selectedOption,
		selectionCount,
		error,
		onSelectSingle,
		onToggleMulti,
		quantityValue,
		onQuantityChange,
		quantitySubtotalCents,
		quantitySelectedOptions
	}: Props = $props();
</script>

{#if category.inputType === 'SELECT'}
	<CategoryChipRadio
		{category}
		{categoryKey}
		{currency}
		value={selectedOption}
		{error}
		onChange={onSelectSingle}
	/>
{:else if category.inputType === 'QUANTITY_LIST'}
	<CategoryQuantityList
		{category}
		{categoryKey}
		{currency}
		{quantityValue}
		{onQuantityChange}
		subtotalCents={quantitySubtotalCents}
		selectedOptions={quantitySelectedOptions}
		{error}
	/>
{:else}
	<CategoryChipCheckbox
		{category}
		{categoryKey}
		{currency}
		{isSelected}
		{selectionCount}
		{error}
		onToggle={onToggleMulti}
	/>
{/if}
