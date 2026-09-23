import { describe, expect, test } from 'vitest';
import { computeEstimate } from './estimator.js';
import { sampleOffering } from './fixtures.js';
import type { Offering, Selections } from './types.js';

const selections: Selections = {
	servingStyle: ['buffet'],
	proteins: ['asada', 'pollo'],
	drinks: ['horchata'],
	appetizers: ['flautas']
};

describe('computeEstimate', () => {
	test('calculates one total for the entered guest count', () => {
		const estimate = computeEstimate(sampleOffering, selections, 175);
		expect(estimate.guestCount).toBe(175);
		expect(estimate.perGuestCents).toBe(2300);
		expect(estimate.perGuestTotalCents).toBe(402500);
		expect(estimate.perEventCents).toBe(30000);
		expect(estimate.minimumAdjustmentCents).toBe(0);
		expect(estimate.totalCents).toBe(432500);
		expect(estimate.lineItems.find((item) => item.id === 'proteins:asada')).toMatchObject({
			included: true,
			amountCents: 0
		});
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
				servingStyle: ['taco_truck'],
				proteins: ['asada', 'pollo', 'chorizo']
			},
			50
		);
		expect(estimate.perGuestCents).toBe(1600);
		expect(estimate.lineItems.find((item) => item.id === 'proteins:chorizo')).toMatchObject({
			amountCents: 100
		});
	});

	test.each([
		['taco_truck', 75000, 22500],
		['buffet', 100000, 43000],
		['other', 55000, 2500]
	])('applies the %s serving style minimum to a 15 guest event', (style, minimum, adjustment) => {
		const estimate = computeEstimate(
			sampleOffering,
			{ servingStyle: [style], proteins: ['asada', 'pollo'] },
			15
		);
		expect(estimate.minimumEventCents).toBe(minimum);
		expect(estimate.minimumAdjustmentCents).toBe(adjustment);
		expect(estimate.totalCents).toBe(minimum);
	});

	test('does not add an adjustment when the itemized total exceeds the style minimum', () => {
		const estimate = computeEstimate(
			sampleOffering,
			{ servingStyle: ['other'], proteins: ['asada', 'pollo'] },
			20
		);
		expect(estimate.minimumAdjustmentCents).toBe(0);
		expect(estimate.totalCents).toBe(60000);
	});

	test('uses a changed configured price without calculator changes', () => {
		const repriced: Offering = {
			...sampleOffering,
			categories: {
				...sampleOffering.categories,
				drinks: {
					...sampleOffering.categories.drinks,
					options: sampleOffering.categories.drinks.options.map((option) =>
						option.id === 'horchata' ? { ...option, priceCents: 250 } : option
					)
				}
			}
		};
		const before = computeEstimate(sampleOffering, selections, 50);
		const after = computeEstimate(repriced, selections, 50);
		expect(after.totalCents - before.totalCents).toBe(50 * 50);
	});
});
