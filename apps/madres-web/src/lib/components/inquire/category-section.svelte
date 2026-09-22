<script lang="ts">
	import type { Category } from '$lib/offering/types.js';
	import CategoryChipRadio from './category-chip-radio.svelte';
	import CategoryChipCheckbox from './category-chip-checkbox.svelte';

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
		onToggleMulti
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
