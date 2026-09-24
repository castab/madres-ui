import { describe, expect, test } from 'vitest';
import { sampleOffering } from './fixtures.js';
import { parseGuestCount } from './guest-count.js';

const field = sampleOffering.guestCountField;

describe('parseGuestCount', () => {
	test('accepts small parties and an exact count above the old ranges', () => {
		expect(parseGuestCount('1', field)).toEqual({ count: 1 });
		expect(parseGuestCount('14', field)).toEqual({ count: 14 });
		expect(parseGuestCount('275', field)).toEqual({ count: 275 });
	});

	test('rejects missing, fractional, and out-of-range counts', () => {
		expect(parseGuestCount('', field).error).toBe('Guest count is required');
		expect(parseGuestCount('15.5', field).count).toBeNull();
		expect(parseGuestCount('0', field).error).toBe('Enter at least 1 guest');
		expect(parseGuestCount('10001', field).count).toBeNull();
	});
});
