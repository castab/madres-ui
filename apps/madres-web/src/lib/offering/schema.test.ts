import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { parseOffering } from './schema.js';
import { sampleOffering } from './fixtures.js';

describe('parseOffering', () => {
	test('accepts a well-formed offering document', () => {
		const result = parseOffering(sampleOffering);
		expect(result.ok).toBe(true);
	});

	test('keeps the deployable example JSON in sync with the offering fixture', () => {
		const envExample = readFileSync(new URL('../../../.env.example', import.meta.url), 'utf8');
		const line = envExample
			.split(/\r?\n/)
			.find((entry) => entry.startsWith('PRIVATE_EVENT_OFFERING_JSON='));
		expect(line).toBeDefined();
		const result = parseOffering(JSON.parse(line!.slice('PRIVATE_EVENT_OFFERING_JSON='.length)));
		expect(result).toEqual({ ok: true, offering: sampleOffering });
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

	test('rejects guest limits in the wrong order', () => {
		const broken = {
			...sampleOffering,
			guestCountField: { ...sampleOffering.guestCountField, maximumGuests: 14 }
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

	test('requires a valid minimum event charge on every serving style', () => {
		for (const minimumEventCents of [undefined, -1, 750.5]) {
			const broken = {
				...sampleOffering,
				categories: {
					...sampleOffering.categories,
					servingStyle: {
						...sampleOffering.categories.servingStyle,
						options: sampleOffering.categories.servingStyle.options.map((option) =>
							option.id === 'taco_truck' ? { ...option, minimumEventCents } : option
						)
					}
				}
			};
			expect(parseOffering(broken).ok).toBe(false);
		}
	});

	test('requires a serving style category', () => {
		const categories: Record<string, unknown> = { ...sampleOffering.categories };
		delete categories.servingStyle;
		expect(parseOffering({ ...sampleOffering, categories }).ok).toBe(false);
	});

	test('rejects a non-integer priceCents (fractional dollars, not integer cents)', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				servingStyle: {
					...sampleOffering.categories.servingStyle,
					options: sampleOffering.categories.servingStyle.options.map((option) =>
						option.id === 'taco_truck' ? { ...option, priceCents: 2300.5 } : option
					)
				}
			}
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

	test('rejects a document missing the required guest count field', () => {
		const broken: Record<string, unknown> = { ...sampleOffering };
		delete broken.guestCountField;
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects an unrecognized guest count input type', () => {
		const broken = {
			...sampleOffering,
			guestCountField: { ...sampleOffering.guestCountField, inputType: 'SELECT' }
		};
		expect(parseOffering(broken).ok).toBe(false);
	});

	test('rejects an unrecognized pricingType', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				servingStyle: { ...sampleOffering.categories.servingStyle, pricingType: 'PER_DURATION' }
			}
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});

	test('rejects the retired base charges', () => {
		expect(parseOffering({ ...sampleOffering, baseCharges: [] }).ok).toBe(false);
	});

	test('requires the serving style rate to be per guest', () => {
		const broken = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				servingStyle: { ...sampleOffering.categories.servingStyle, pricingType: 'PER_EVENT' }
			}
		};
		expect(parseOffering(broken).ok).toBe(false);
	});

	test('rejects an unrecognized additionalNotesField.inputType', () => {
		const broken = {
			...sampleOffering,
			additionalNotesField: { ...sampleOffering.additionalNotesField, inputType: 'TEXT' }
		};
		const result = parseOffering(broken);
		expect(result.ok).toBe(false);
	});
});
