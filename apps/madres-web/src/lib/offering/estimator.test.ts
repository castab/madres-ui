import { describe, expect, test } from 'vitest';
import { computeEstimate } from './estimator.js';
import { sampleOffering } from './fixtures.js';
import type { Offering, Selections } from './types.js';

const selections: Selections = {
	serviceDuration: ['duration_180'],
	servingStyle: ['buffet'],
	proteins: ['asada', 'pollo'],
	drinks: ['horchata'],
	appetizers: ['flautas']
};

describe('computeEstimate', () => {
	test('calculates one total for the entered guest count', () => {
		const estimate = computeEstimate(sampleOffering, selections, 175);
		expect(estimate.guestCount).toBe(175);
		expect(estimate.perGuestCents).toBe(2600);
		expect(estimate.perGuestTotalCents).toBe(455000);
		expect(estimate.perEventCents).toBe(30000);
		expect(estimate.totalCents).toBe(485000);
		expect(estimate.lineItems.find((item) => item.id === 'proteins:asada')).toMatchObject({
			included: true,
			amountCents: 0
		});
	});

	test('per-guest premiums scale with guest count while per-event charges stay fixed', () => {
		const at15 = computeEstimate(sampleOffering, selections, 15);
		const at150 = computeEstimate(sampleOffering, selections, 150);
		expect(at150.perEventCents).toBe(at15.perEventCents);
		expect(at150.totalCents - at15.totalCents).toBe(at15.perGuestCents * 135);
	});

	test('charges additional proteins after including the two highest priced choices', () => {
		const estimate = computeEstimate(
			sampleOffering,
			{
				serviceDuration: ['duration_90'],
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
