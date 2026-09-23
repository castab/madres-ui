import type {
	Category,
	Estimate,
	EstimateLineItem,
	Offering,
	Option,
	SelectionPricing,
	Selections
} from './types.js';

function highestPricedContributions(
	category: Category,
	selectedOptions: Option[],
	selectionPricing: SelectionPricing
): { option: Option; amountCents: number; included: boolean }[] {
	// Ties resolve by each option's original position in the category — the monetary result
	// is identical either way, but this keeps which options are "included" deterministic.
	const optionOrder = new Map(category.options.map((option, index) => [option.id, index]));
	const sorted = [...selectedOptions].sort((a, b) => {
		if (b.priceCents !== a.priceCents) return b.priceCents - a.priceCents;
		return (optionOrder.get(a.id) ?? 0) - (optionOrder.get(b.id) ?? 0);
	});
	return sorted.map((option, index) => {
		const isIncludedSlot = index < selectionPricing.includedSelections;
		const amountCents =
			isIncludedSlot || !selectionPricing.chargeRemainingSelections ? 0 : option.priceCents;
		return { option, amountCents, included: isIncludedSlot };
	});
}

/**
 * Pure pricing calculation: `offering` (validated config) + `selections` (option ids picked
 * per category key) in, a structured `Estimate` out. All money is integer cents throughout —
 * never floating-point dollars. This function contains no offering-specific knowledge (no
 * option ids, no category names) — every dollar amount and every label comes from `offering`.
 *
 * The per-guest rate is computed once and multiplied by the entered guest count.
 */
export function computeEstimate(
	offering: Offering,
	selections: Selections,
	guestCount: number
): Estimate {
	let perEventCents = 0;
	let perGuestCents = 0;
	const lineItems: EstimateLineItem[] = [];

	for (const charge of offering.baseCharges) {
		if (charge.pricingType === 'NONE') continue;
		if (charge.pricingType === 'PER_EVENT') {
			perEventCents += charge.priceCents;
		} else {
			perGuestCents += charge.priceCents;
		}
		lineItems.push({
			id: `base:${charge.id}`,
			label: charge.label,
			kind: charge.pricingType === 'PER_EVENT' ? 'per-event' : 'per-guest',
			amountCents: charge.priceCents
		});
	}

	for (const [categoryKey, category] of Object.entries(offering.categories)) {
		if (category.pricingType === 'NONE') continue;

		const selectedIds = selections[categoryKey] ?? [];
		const selectedOptions = category.options.filter((option) => selectedIds.includes(option.id));
		if (selectedOptions.length === 0) continue;

		const usesHighestPriced =
			category.selectionPricing?.includedSelectionStrategy === 'HIGHEST_PRICED_SELECTED';
		const contributions = usesHighestPriced
			? highestPricedContributions(category, selectedOptions, category.selectionPricing!)
			: selectedOptions.map((option) => ({
					option,
					amountCents: option.priceCents,
					included: false
				}));

		for (const { option, amountCents, included } of contributions) {
			if (category.pricingType === 'PER_EVENT') {
				perEventCents += amountCents;
			} else {
				perGuestCents += amountCents;
			}

			// A non-included, zero-cost pick adds nothing worth
			// showing. Included picks are always shown so the UI can render "Included".
			if (!included && amountCents === 0) continue;

			lineItems.push({
				id: `${categoryKey}:${option.id}`,
				label:
					usesHighestPriced && !included
						? `Additional ${category.label}: ${option.label}`
						: option.label,
				kind: category.pricingType === 'PER_EVENT' ? 'per-event' : 'per-guest',
				amountCents,
				...(included ? { included: true } : {})
			});
		}
	}

	const perGuestTotalCents = perGuestCents * guestCount;
	const selectedServingStyle = offering.categories.servingStyle.options.find(
		(option) => option.id === selections.servingStyle?.[0]
	);
	const minimumEventCents = selectedServingStyle?.minimumEventCents ?? 0;
	const minimumAdjustmentCents = Math.max(
		0,
		minimumEventCents - perEventCents - perGuestTotalCents
	);

	return {
		guestCount,
		perEventCents,
		perGuestCents,
		perGuestTotalCents,
		minimumEventCents,
		minimumAdjustmentCents,
		totalCents: perEventCents + perGuestTotalCents + minimumAdjustmentCents,
		lineItems
	};
}
