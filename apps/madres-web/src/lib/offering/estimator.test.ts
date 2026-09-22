import { describe, expect, test } from 'vitest';
import { computeEstimate } from './estimator.js';
import { sampleOffering } from './fixtures.js';
import type { Offering, Selections } from './types.js';

function lineItem(estimate: ReturnType<typeof computeEstimate>, id: string) {
	return estimate.lineItems.find((item) => item.id === id);
}

describe('computeEstimate', () => {
	test('basic estimate: 175 guests, 3-hour buffet, two included proteins, one drink, one appetizer', () => {
		const selections: Selections = {
			guestCount: ['guest_101_175'],
			serviceDuration: ['duration_180'],
			servingStyle: ['buffet'],
			proteins: ['asada', 'pollo'],
			drinks: ['horchata'],
			appetizers: ['flautas']
		};

		const estimate = computeEstimate(sampleOffering, selections);

		// guest_101_175 bands 101–175 guests, so the estimate is a range: the high end
		// ($4,850 at 175 guests) matches the flat worked example this fixture is built from.
		expect(estimate.guestCountLow).toBe(101);
		expect(estimate.guestCountHigh).toBe(175);
		expect(estimate.perGuestCents).toBe(2600); // 15 + 3 + 3 + 0 + 0 + 2 + 3 = $26/guest
		expect(estimate.perGuestTotalCentsLow).toBe(262600); // 101 * $26 = $2,626
		expect(estimate.perGuestTotalCentsHigh).toBe(455000); // 175 * $26 = $4,550
		expect(estimate.perEventCents).toBe(30000);
		expect(estimate.totalCentsLow).toBe(292600); // $300 + $2,626 = $2,926
		expect(estimate.totalCentsHigh).toBe(485000); // $300 + $4,550 = $4,850

		expect(lineItem(estimate, 'proteins:asada')).toMatchObject({ included: true, amountCents: 0 });
		expect(lineItem(estimate, 'proteins:pollo')).toMatchObject({ included: true, amountCents: 0 });
	});

	test('extra protein beyond the included two is charged at its own configured price', () => {
		const selections: Selections = {
			guestCount: ['guest_101_175'],
			serviceDuration: ['duration_90'],
			servingStyle: ['taco_truck'],
			proteins: ['asada', 'pollo', 'chorizo']
		};

		const estimate = computeEstimate(sampleOffering, selections);

		// Asada ($4) and Pollo ($2) are the two highest-priced -> included. Chorizo ($1) is
		// the remainder -> charged its own price. Premium is +$1/guest, not the sum of the
		// two cheapest and not a flat "extra protein" fee.
		expect(lineItem(estimate, 'proteins:chorizo')).toMatchObject({ amountCents: 100 });
		expect(lineItem(estimate, 'proteins:asada')).toMatchObject({ included: true });
		expect(lineItem(estimate, 'proteins:pollo')).toMatchObject({ included: true });
		expect(estimate.perGuestCents).toBe(1500 + 100); // base food service + $1 protein premium
	});

	test('highest-priced-selected inclusion: the two highest-priced picks are free, the rest are charged', () => {
		const selections: Selections = {
			guestCount: ['guest_101_175'],
			serviceDuration: ['duration_90'],
			servingStyle: ['taco_truck'],
			proteins: ['asada', 'adobada', 'pollo', 'chorizo']
		};

		const estimate = computeEstimate(sampleOffering, selections);

		expect(lineItem(estimate, 'proteins:asada')).toMatchObject({ included: true });
		expect(lineItem(estimate, 'proteins:adobada')).toMatchObject({ included: true });
		expect(lineItem(estimate, 'proteins:pollo')).toMatchObject({ amountCents: 200 });
		expect(lineItem(estimate, 'proteins:pollo')?.included).toBeUndefined();
		expect(lineItem(estimate, 'proteins:chorizo')).toMatchObject({ amountCents: 100 });
		expect(lineItem(estimate, 'proteins:chorizo')?.included).toBeUndefined();

		const proteinPremiumCents = estimate.perGuestCents - 1500; // subtract base food service
		expect(proteinPremiumCents).toBe(300); // $2 (Pollo) + $1 (Chorizo) = $3/guest
	});

	test('a per-guest premium (service duration) scales with guest count instead of behaving as a flat event fee', () => {
		const base: Omit<Selections, 'guestCount'> = {
			serviceDuration: ['duration_180'], // +$3/guest
			servingStyle: ['taco_truck'],
			proteins: ['asada', 'pollo']
		};

		const at100 = computeEstimate(sampleOffering, { ...base, guestCount: ['guest_25_100'] });
		const at175 = computeEstimate(sampleOffering, { ...base, guestCount: ['guest_101_175'] });

		const durationDeltaAt100 =
			at100.totalCentsHigh -
			computeEstimate(sampleOffering, {
				...base,
				serviceDuration: ['duration_90'],
				guestCount: ['guest_25_100']
			}).totalCentsHigh;
		const durationDeltaAt175 =
			at175.totalCentsHigh -
			computeEstimate(sampleOffering, {
				...base,
				serviceDuration: ['duration_90'],
				guestCount: ['guest_101_175']
			}).totalCentsHigh;

		expect(durationDeltaAt100).toBe(300 * 100); // $3/guest * 100 guests
		expect(durationDeltaAt175).toBe(300 * 175); // $3/guest * 175 guests
		expect(durationDeltaAt175).toBeGreaterThan(durationDeltaAt100);
	});

	test('zero selected drinks and zero selected appetizers add no charge', () => {
		const selections: Selections = {
			guestCount: ['guest_25_100'],
			serviceDuration: ['duration_90'],
			servingStyle: ['taco_truck'],
			proteins: ['asada', 'pollo']
			// drinks / appetizers omitted entirely
		};

		const estimate = computeEstimate(sampleOffering, selections);

		expect(estimate.lineItems.some((item) => item.id.startsWith('drinks:'))).toBe(false);
		expect(estimate.lineItems.some((item) => item.id.startsWith('appetizers:'))).toBe(false);
		expect(estimate.perGuestCents).toBe(1500); // base food service only
	});

	test('PER_EVENT base charges do not scale with guest count', () => {
		const base: Omit<Selections, 'guestCount'> = {
			serviceDuration: ['duration_90'],
			servingStyle: ['taco_truck'],
			proteins: ['asada', 'pollo']
		};

		const smallEvent = computeEstimate(sampleOffering, { ...base, guestCount: ['guest_25_100'] });
		const largeEvent = computeEstimate(sampleOffering, { ...base, guestCount: ['guest_251_plus'] });

		expect(smallEvent.perEventCents).toBe(30000);
		expect(largeEvent.perEventCents).toBe(30000);
		expect(smallEvent.guestCountHigh).not.toBe(largeEvent.guestCountHigh);
	});

	test('the open-ended top guest band has no maximum, so its range collapses to a single value at minimumGuests', () => {
		const estimate = computeEstimate(sampleOffering, {
			guestCount: ['guest_251_plus'],
			serviceDuration: ['duration_90'],
			servingStyle: ['taco_truck'],
			proteins: ['asada', 'pollo']
		});

		expect(estimate.guestCountLow).toBe(251);
		expect(estimate.guestCountHigh).toBe(251);
	});

	test('a closed guest band produces a real low/high range bracketing minimumGuests and maximumGuests', () => {
		const estimate = computeEstimate(sampleOffering, {
			guestCount: ['guest_25_100'],
			serviceDuration: ['duration_90'],
			servingStyle: ['taco_truck'],
			proteins: ['asada', 'pollo']
		});

		// $300 base + $15/guest base food service, no other premiums selected.
		expect(estimate.guestCountLow).toBe(25);
		expect(estimate.guestCountHigh).toBe(100);
		expect(estimate.totalCentsLow).toBe(30000 + 1500 * 25); // $675
		expect(estimate.totalCentsHigh).toBe(30000 + 1500 * 100); // $1,800
		expect(estimate.totalCentsLow).toBeLessThan(estimate.totalCentsHigh);
	});

	test('changing a configured price (Horchata $2.00 -> $2.50) changes the estimate with no calculator code changes', () => {
		const selections: Selections = {
			guestCount: ['guest_25_100'],
			serviceDuration: ['duration_90'],
			servingStyle: ['taco_truck'],
			proteins: ['asada', 'pollo'],
			drinks: ['horchata']
		};

		const before = computeEstimate(sampleOffering, selections);

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
		const after = computeEstimate(repriced, selections);

		expect(lineItem(before, 'drinks:horchata')).toMatchObject({ amountCents: 200 });
		expect(lineItem(after, 'drinks:horchata')).toMatchObject({ amountCents: 250 });
		expect(after.totalCentsHigh - before.totalCentsHigh).toBe((250 - 200) * before.guestCountHigh);
	});
});
