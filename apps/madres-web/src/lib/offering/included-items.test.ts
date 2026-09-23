import { describe, expect, test } from 'vitest';
import { sampleOffering } from './fixtures.js';
import { includedItemsForServingStyle } from './included-items.js';

describe('includedItemsForServingStyle', () => {
	test('keeps rice and beans for the truck and buffet', () => {
		for (const style of ['taco_truck', 'buffet']) {
			const [tablescape] = includedItemsForServingStyle(sampleOffering.includedItems, style);
			expect(tablescape.contents?.map((content) => content.label)).toContain('Rice');
			expect(tablescape.contents?.map((content) => content.label)).toContain('Beans');
		}
	});

	test('excludes rice and beans for Just the Tacos while keeping chips and toppings', () => {
		const [tablescape] = includedItemsForServingStyle(sampleOffering.includedItems, 'just_tacos');
		const labels = tablescape.contents?.map((content) => content.label) ?? [];
		expect(labels).not.toContain('Rice');
		expect(labels).not.toContain('Beans');
		expect(labels).toContain('Chips');
		expect(labels.some((label) => label.startsWith('Taco toppings:'))).toBe(true);
	});
});
