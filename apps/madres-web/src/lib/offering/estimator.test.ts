import { describe, expect, test } from 'vitest';
import { computeEstimate } from './estimator.js';
import { sampleOffering } from './fixtures.js';
import type { Offering, Selections } from './types.js';

const selections: Selections = {
	servingStyle: ['buffet'],
	proteins: ['asada', 'pollo'],
	drinks: ['horchata'],
	appetizers: []
};

describe('computeEstimate', () => {
	test('calculates one total for the entered guest count', () => {
		const estimate = computeEstimate(sampleOffering, selections, 175);
		expect(estimate.guestCount).toBe(175);
		expect(estimate.perGuestCents).toBe(2850);
		expect(estimate.perGuestTotalCents).toBe(498750);
		expect(estimate.perEventCents).toBe(0);
		expect(estimate.itemTotalCents).toBe(0);
		expect(estimate.minimumAdjustmentCents).toBe(0);
		expect(estimate.totalCents).toBe(498750);
		expect(estimate.lineItems.find((item) => item.id === 'proteins:asada')).toMatchObject({
			included: true,
			amountCents: 0
		});
	});

	test('prices appetizer quantities by item, independently of guest count', () => {
		const quantities = { appetizers: { flautas: 100, fruit_cup_spread: 25 } };
		const at15 = computeEstimate(sampleOffering, selections, 15, quantities);
		const at50 = computeEstimate(sampleOffering, selections, 50, quantities);
		expect(at15.itemTotalCents).toBe(50000);
		expect(at50.itemTotalCents).toBe(50000);
		expect(at15.perGuestCents).toBe(2850);
		expect(at15.totalCents).toBe(152250);
		expect(at50.totalCents).toBe(192500);
		expect(at15.lineItems.find((item) => item.id === 'appetizers:flautas')).toMatchObject({
			kind: 'per-item',
			amountCents: 35000,
			unitCents: 350,
			quantity: 100
		});
	});

	test('adds optional drinks and appetizer orders above the serving style floor', () => {
		const base = computeEstimate(
			sampleOffering,
			{ servingStyle: ['buffet'], proteins: ['asada', 'pollo'] },
			15
		);
		const withExtras = computeEstimate(sampleOffering, selections, 15, {
			appetizers: { chorizo_avocado_toast: 125 }
		});
		expect(base.totalCents).toBe(100000);
		expect(withExtras.minimumAdjustmentCents).toBe(59500);
		expect(withExtras.itemTotalCents).toBe(50000);
		expect(withExtras.totalCents).toBe(152250);
	});

	test('prices both drinks per guest above the serving style floor', () => {
		const estimate = computeEstimate(
			sampleOffering,
			{
				servingStyle: ['just_tacos'],
				proteins: ['asada', 'pollo'],
				drinks: ['fruit_infused_water', 'horchata']
			},
			1
		);
		expect(estimate.perGuestCents).toBe(2250);
		expect(estimate.minimumAdjustmentCents).toBe(48000);
		expect(estimate.totalCents).toBe(50250);
	});

	test('uses the four configured appetizer unit prices', () => {
		const estimate = computeEstimate(sampleOffering, selections, 100, {
			appetizers: {
				flautas: 1,
				chorizo_avocado_toast: 1,
				elote_en_vaso: 1,
				fruit_cup_spread: 1
			}
		});
		expect(estimate.itemTotalCents).toBe(1700);
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
		expect(estimate.perGuestCents).toBe(2400);
		expect(estimate.lineItems.find((item) => item.id === 'proteins:chorizo')).toMatchObject({
			amountCents: 100
		});
	});

	test.each([
		['taco_truck', 75000, 40500],
		['buffet', 100000, 59500],
		['just_tacos', 50000, 20000]
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
			{ servingStyle: ['just_tacos'], proteins: ['asada', 'pollo'] },
			30
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
						option.id === 'horchata' ? { ...option, priceCents: 200 } : option
					)
				}
			}
		};
		const before = computeEstimate(sampleOffering, selections, 50);
		const after = computeEstimate(repriced, selections, 50);
		expect(after.totalCents - before.totalCents).toBe(50 * 50);
	});
});
