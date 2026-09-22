import { describe, expect, test } from 'vitest';
import { parseOffering } from './schema.js';
import { sampleOffering } from './fixtures.js';

describe('parseOffering', () => {
	test('accepts a well-formed offering document', () => {
		const result = parseOffering(sampleOffering);
		expect(result.ok).toBe(true);
	});

	test('rejects a JSON string instead of a parsed object (offering.server is responsible for JSON.parse)', () => {
		const result = parseOffering(JSON.stringify(sampleOffering));
		expect(result.ok).toBe(false);
	});

	test('rejects garbage input cleanly', () => {
		const result = parseOffering({ nope: true });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.issues.length).toBeGreaterThan(0);
	});

	test('rejects a category missing required guest facts', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				guestCount: {
					...sampleOffering.categories.guestCount,
					options: [{ id: 'guest_25_100', label: '25–100', priceCents: 0 }] // no facts
				}
			}
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects maxSelections < minSelections', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				proteins: { ...sampleOffering.categories.proteins, minSelections: 3, maxSelections: 2 }
			}
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects a negative priceCents', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				drinks: {
					...sampleOffering.categories.drinks,
					options: sampleOffering.categories.drinks.options.map((option) =>
						option.id === 'horchata' ? { ...option, priceCents: -200 } : option
					)
				}
			}
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects a non-integer priceCents (fractional dollars, not integer cents)', () => {
		const broken = {
			...sampleOffering,
			baseCharges: sampleOffering.baseCharges.map((charge) =>
				charge.id === 'base_event_fee' ? { ...charge, priceCents: 300.5 } : charge
			)
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects a duplicate option id within a category', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				drinks: {
					...sampleOffering.categories.drinks,
					options: [
						...sampleOffering.categories.drinks.options,
						{ id: 'horchata', label: 'Horchata (duplicate)', priceCents: 999 }
					]
				}
			}
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects an unrecognized includedSelectionStrategy instead of behaving incorrectly', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				proteins: {
					...sampleOffering.categories.proteins,
					selectionPricing: {
						...sampleOffering.categories.proteins.selectionPricing,
						includedSelectionStrategy: 'CHEAPEST_FIRST'
					}
				}
			}
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects includedSelections greater than the category maxSelections', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				proteins: {
					...sampleOffering.categories.proteins,
					selectionPricing: {
						...sampleOffering.categories.proteins.selectionPricing,
						includedSelections: 10
					}
				}
			}
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects inputType "SELECT" on a category whose maxSelections is not 1', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				drinks: { ...sampleOffering.categories.drinks, inputType: 'SELECT' }
			}
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects an unrecognized inputType', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				drinks: { ...sampleOffering.categories.drinks, inputType: 'RADIO_CARDS' }
			}
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects a document missing the required guestCount category', () => {
		const restCategories = Object.fromEntries(
			Object.entries(sampleOffering.categories).filter(([key]) => key !== 'guestCount')
		);
		const broken = { ...sampleOffering, categories: restCategories };
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects an unrecognized pricingType', () => {
		const broken = {
			...sampleOffering,
			baseCharges: sampleOffering.baseCharges.map((charge) =>
				charge.id === 'base_event_fee' ? { ...charge, pricingType: 'PER_DURATION' } : charge
			)
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});
});
