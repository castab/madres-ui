import { formatCents } from './money.js';
import type { Category } from './types.js';

/** Blank means no order; malformed, fractional, negative, and oversized counts are invalid. */
export function parseItemQuantity(raw: string, maximum: number): number | null {
	const value = raw.trim();
	if (value === '') return 0;
	if (!/^\d+$/.test(value)) return null;
	const quantity = Number(value);
	return Number.isSafeInteger(quantity) && quantity <= maximum ? quantity : null;
}

export function parseQuantityFormData(
	categoryKey: string,
	category: Category,
	formData: FormData
): Record<string, number> {
	const quantities: Record<string, number> = {};
	for (const option of category.options) {
		const values = formData.getAll(`${categoryKey}:${option.id}`);
		quantities[option.id] =
			values.length > 1
				? Number.NaN
				: (parseItemQuantity(String(values[0] ?? ''), category.maximumQuantityPerOption ?? 0) ??
					Number.NaN);
	}
	return quantities;
}

export type QuantityOrderStatus = {
	subtotalCents: number;
	selectedOptions: number;
	error?: string;
};

export function quantityOrderStatus(
	category: Category,
	quantities: Record<string, number>,
	currency: string
): QuantityOrderStatus {
	let subtotalCents = 0;
	let selectedOptions = 0;
	const maximum = category.maximumQuantityPerOption ?? 0;
	for (const option of category.options) {
		const quantity = quantities[option.id] ?? 0;
		if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > maximum) {
			return {
				subtotalCents: 0,
				selectedOptions: 0,
				error: `Enter whole item quantities from 0 to ${maximum}.`
			};
		}
		if (quantity > 0) {
			selectedOptions += 1;
			subtotalCents += quantity * option.priceCents;
		}
	}
	if (selectedOptions > category.maxSelections) {
		return {
			subtotalCents,
			selectedOptions,
			error: `Choose up to ${category.maxSelections} items.`
		};
	}
	if (selectedOptions > 0 && subtotalCents < (category.minimumOrderCents ?? 0)) {
		return {
			subtotalCents,
			selectedOptions,
			error: `Order at least ${formatCents(category.minimumOrderCents ?? 0, currency)} in ${category.label.toLowerCase()}, or leave all quantities at 0.`
		};
	}
	return { subtotalCents, selectedOptions };
}
