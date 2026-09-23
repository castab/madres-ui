import { describe, expect, test } from 'vitest';
import { formatCents } from './money.js';

describe('formatCents', () => {
	test('omits decimals for whole-dollar amounts', () => {
		expect(formatCents(30000, 'USD')).toBe('$300');
	});

	test('keeps decimals for a fractional amount', () => {
		expect(formatCents(150, 'USD')).toBe('$1.50');
	});
});
