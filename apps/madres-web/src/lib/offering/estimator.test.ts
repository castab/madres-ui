import { describe, expect, test } from 'vitest';
import { computeEstimate } from './estimator.js';
import { sampleOffering } from './fixtures.js';
import type { Offering, Selections } from './types.js';

const selections: Selections = {
	servingStyle: ['style_b'],
	proteins: ['filling_a', 'filling_c'],
	drinks: ['beverage_b'],
	appetizers: []
};

describe('computeEstimate', () => {
	test('calculates one total for the entered guest count', () => {
		const estimate = computeEstimate(sampleOffering, selections, 175);
		expect(estimate.guestCount).toBe(175);
		expect(estimate.perGuestCents).toBe(1325);
		expect(estimate.perGuestTotalCents).toBe(231875);
		expect(estimate.perEventCents).toBe(0);
		expect(estimate.itemTotalCents).toBe(0);
		expect(estimate.minimumAdjustmentCents).toBe(0);
		expect(estimate.totalCents).toBe(231875);
		expect(estimate.lineItems.find((item) => item.id === 'proteins:filling_a')).toMatchObject({
			included: true,
			amountCents: 0
		});
	});

	test('prices appetizer quantities by item, independently of guest count', () => {
		const quantities = { appetizers: { item_a: 20, item_b: 20 } };
		const at15 = computeEstimate(sampleOffering, selections, 15, quantities);
		const at50 = computeEstimate(sampleOffering, selections, 50, quantities);
		expect(at15.itemTotalCents).toBe(10000);
		expect(at50.itemTotalCents).toBe(10000);
		expect(at15.perGuestCents).toBe(1325);
		expect(at15.totalCents).toBe(31875);
		expect(at50.totalCents).toBe(76250);
		expect(at15.lineItems.find((item) => item.id === 'appetizers:item_a')).toMatchObject({
			kind: 'per-item',
			amountCents: 4000,
			unitCents: 200,
			quantity: 20
		});
	});

	test('adds optional drinks and appetizer orders above the serving style floor', () => {
		const base = computeEstimate(
			sampleOffering,
			{ servingStyle: ['style_b'], proteins: ['filling_a', 'filling_c'] },
			15
		);
		const withExtras = computeEstimate(sampleOffering, selections, 15, {
			appetizers: { item_d: 20 }
		});
		expect(base.totalCents).toBe(20000);
		expect(withExtras.minimumAdjustmentCents).toBe(2000);
		expect(withExtras.itemTotalCents).toBe(10000);
		expect(withExtras.totalCents).toBe(31875);
	});

	test('prices both drinks per guest above the serving style floor', () => {
		const estimate = computeEstimate(
			sampleOffering,
			{
				servingStyle: ['style_c'],
				proteins: ['filling_a', 'filling_c'],
				drinks: ['beverage_a', 'beverage_b']
			},
			1
		);
		expect(estimate.perGuestCents).toBe(1000);
		expect(estimate.minimumAdjustmentCents).toBe(7200);
		expect(estimate.totalCents).toBe(8200);
	});

	test('uses the four configured appetizer unit prices', () => {
		const estimate = computeEstimate(sampleOffering, selections, 100, {
			appetizers: {
				item_a: 1,
				item_d: 1,
				item_c: 1,
				item_b: 1
			}
		});
		expect(estimate.itemTotalCents).toBe(1400);
	});

	test('per-guest premiums scale with guest count while per-event charges stay fixed', () => {
		const at50 = computeEstimate(sampleOffering, selections, 50);
		const at150 = computeEstimate(sampleOffering, selections, 150);
		expect(at150.perEventCents).toBe(at50.perEventCents);
		expect(at150.totalCents - at50.totalCents).toBe(at50.perGuestCents * 100);
	});

	test('charges additional proteins after including the two highest priced choices', () => {
		const estimate = computeEstimate(
			sampleOffering,
			{
				servingStyle: ['style_a'],
				proteins: ['filling_a', 'filling_c', 'filling_d']
			},
			50
		);
		expect(estimate.perGuestCents).toBe(1050);
		expect(estimate.lineItems.find((item) => item.id === 'proteins:filling_d')).toMatchObject({
			amountCents: 50
		});
	});

	test.each([
		['style_a', 10000, 9000],
		['style_b', 20000, 18800],
		['style_c', 8000, 7200]
	])('applies the %s serving style minimum to a one guest event', (style, minimum, adjustment) => {
		const estimate = computeEstimate(
			sampleOffering,
			{ servingStyle: [style], proteins: ['filling_a', 'filling_c'] },
			1
		);
		expect(estimate.minimumEventCents).toBe(minimum);
		expect(estimate.minimumAdjustmentCents).toBe(adjustment);
		expect(estimate.totalCents).toBe(minimum);
	});

	test('does not add an adjustment when the itemized total exceeds the style minimum', () => {
		const estimate = computeEstimate(
			sampleOffering,
			{ servingStyle: ['style_c'], proteins: ['filling_a', 'filling_c'] },
			30
		);
		expect(estimate.minimumAdjustmentCents).toBe(0);
		expect(estimate.totalCents).toBe(24000);
	});

	test('uses a changed configured price without calculator changes', () => {
		const repriced: Offering = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				drinks: {
					...sampleOffering.categories.drinks,
					options: sampleOffering.categories.drinks.options.map((option) =>
						option.id === 'beverage_b' ? { ...option, priceCents: 175 } : option
					)
				}
			}
		};
		const before = computeEstimate(sampleOffering, selections, 50);
		const after = computeEstimate(repriced, selections, 50);
		expect(after.totalCents - before.totalCents).toBe(50 * 50);
	});
});
