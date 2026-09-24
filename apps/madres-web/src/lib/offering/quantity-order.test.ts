import { describe, expect, test } from 'vitest';
import { sampleOffering } from './fixtures.js';
import { parseItemQuantity, parseQuantityFormData, quantityOrderStatus } from './quantity-order.js';

const category = sampleOffering.categories.appetizers;

describe('item quantities', () => {
	test('allows ordering none', () => {
		expect(quantityOrderStatus(category, {}, 'USD')).toEqual({
			subtotalCents: 0,
			selectedOptions: 0
		});
	});

	test('accepts a mixed order at the example minimum', () => {
		expect(quantityOrderStatus(category, { item_a: 20, item_b: 20 }, 'USD')).toEqual({
			subtotalCents: 10000,
			selectedOptions: 2
		});
	});

	test('rejects a nonzero order below the item minimum', () => {
		const result = quantityOrderStatus(category, { item_a: 1 }, 'USD');
		expect(result.subtotalCents).toBe(200);
		expect(result.error).toContain('$100');
	});

	test.each(['-1', '1.5', '1e2', '1001', 'abc'])(
		'rejects malformed or excessive quantity %s',
		(raw) => {
			expect(parseItemQuantity(raw, 1000)).toBeNull();
		}
	);

	test('treats blank as zero and accepts whole item counts', () => {
		expect(parseItemQuantity('', 1000)).toBe(0);
		expect(parseItemQuantity('125', 1000)).toBe(125);
	});

	test('parses posted item counts and rejects duplicate fields', () => {
		const formData = new FormData();
		formData.set('appetizers:item_a', '20');
		formData.set('appetizers:item_b', '20');
		const quantities = parseQuantityFormData('appetizers', category, formData);
		expect(quantityOrderStatus(category, quantities, 'USD').subtotalCents).toBe(10000);
		formData.append('appetizers:item_a', '20');
		const duplicate = parseQuantityFormData('appetizers', category, formData);
		expect(quantityOrderStatus(category, duplicate, 'USD').error).toContain(
			'whole item quantities'
		);
	});
});
