import { describe, expect, test } from 'vitest';
import { formatCents, formatCentsRange, formatGuestRange } from './money.js';

describe('formatCents', () => {
	test('omits decimals for whole-dollar amounts', () => {
		expect(formatCents(30000, 'USD')).toBe('$300');
	});

	test('keeps decimals for a fractional amount', () => {
		expect(formatCents(150, 'USD')).toBe('$1.50');
	});
});

describe('formatCentsRange', () => {
	test('formats a real low/high range', () => {
		expect(formatCentsRange(292600, 485000, 'USD')).toBe('$2,926 – $4,850');
	});

	test('collapses to a single amount when low and high are equal', () => {
		expect(formatCentsRange(30000, 30000, 'USD')).toBe('$300');
	});

	test('formats as a floor ("$X+"), not a bare amount, when openEnded', () => {
		expect(formatCentsRange(592600, 592600, 'USD', true)).toBe('$5,926+');
	});
});

describe('formatGuestRange', () => {
	test('formats a real low/high range', () => {
		expect(formatGuestRange(25, 100)).toBe('25–100');
	});

	test('collapses to a single number when low and high are equal', () => {
		expect(formatGuestRange(0, 0)).toBe('0');
	});

	test('formats as a floor ("251+"), not a bare number, when openEnded', () => {
		expect(formatGuestRange(251, 251, true)).toBe('251+');
	});
});
