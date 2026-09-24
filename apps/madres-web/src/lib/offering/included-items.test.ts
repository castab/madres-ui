import { describe, expect, test } from 'vitest';
import { sampleOffering } from './fixtures.js';
import { includedItemsForServingStyle } from './included-items.js';

describe('includedItemsForServingStyle', () => {
	test('includes shared supplies with every service style', () => {
		for (const style of sampleOffering.categories.servingStyle.options) {
			const [setup] = includedItemsForServingStyle(sampleOffering.includedItems, style.id);
			const labels = setup.contents?.map((content) => content.label) ?? [];
			expect(labels).toContain('Shared supplies');
		}
	});

	test('includes both example components for styles A and B', () => {
		for (const style of ['style_a', 'style_b']) {
			const [setup] = includedItemsForServingStyle(sampleOffering.includedItems, style);
			expect(setup.contents?.map((content) => content.label)).toContain('Component A');
			expect(setup.contents?.map((content) => content.label)).toContain('Component B');
		}
	});

	test('excludes selected components for style C', () => {
		const [setup] = includedItemsForServingStyle(sampleOffering.includedItems, 'style_c');
		const labels = setup.contents?.map((content) => content.label) ?? [];
		expect(labels).not.toContain('Component A');
		expect(labels).not.toContain('Component B');
		expect(labels).toContain('Shared supplies');
	});
});
