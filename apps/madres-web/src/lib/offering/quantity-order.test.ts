import { describe, expect, test } from 'vitest';
import { sampleOffering } from './fixtures.js';
import { parseItemQuantity, parseQuantityFormData, quantityOrderStatus } from './quantity-order.js';

const category = sampleOffering.categories.appetizers;

describe('appetizer quantities', () => {
	test('allows ordering none', () => {
		expect(quantityOrderStatus(category, {}, 'USD')).toEqual({
			subtotalCents: 0,
			selectedOptions: 0
		});
	});

	test('accepts a mixed order at the $500 minimum', () => {
		expect(quantityOrderStatus(category, { flautas: 100, fruit_cup_spread: 25 }, 'USD')).toEqual({
			subtotalCents: 50000,
			selectedOptions: 2
		});
	});

	test('rejects a nonzero order below the appetizer minimum', () => {
		const result = quantityOrderStatus(category, { flautas: 1 }, 'USD');
		expect(result.subtotalCents).toBe(350);
		expect(result.error).toContain('$500');
	});

	test.each(['-1', '1.5', '1e2', '10001', 'abc'])(
		'rejects malformed or excessive quantity %s',
		(raw) => {
			expect(parseItemQuantity(raw, 10000)).toBeNull();
		}
	);

	test('treats blank as zero and accepts whole item counts', () => {
		expect(parseItemQuantity('', 10000)).toBe(0);
		expect(parseItemQuantity('125', 10000)).toBe(125);
	});

	test('parses posted item counts and rejects duplicate fields', () => {
		const formData = new FormData();
		formData.set('appetizers:flautas', '100');
		formData.set('appetizers:fruit_cup_spread', '25');
		const quantities = parseQuantityFormData('appetizers', category, formData);
		expect(quantityOrderStatus(category, quantities, 'USD').subtotalCents).toBe(50000);
		formData.append('appetizers:flautas', '100');
		const duplicate = parseQuantityFormData('appetizers', category, formData);
		expect(quantityOrderStatus(category, duplicate, 'USD').error).toContain(
			'whole item quantities'
		);
	});
});
