import { describe, expect, test } from 'vitest';
import { sampleOffering } from './fixtures.js';
import { parseGuestCount } from './guest-count.js';

const field = sampleOffering.guestCountField;

describe('parseGuestCount', () => {
	test('accepts the configured minimum and an exact count above the old ranges', () => {
		expect(parseGuestCount('15', field)).toEqual({ count: 15 });
		expect(parseGuestCount('275', field)).toEqual({ count: 275 });
	});

	test('rejects missing, fractional, and out-of-range counts', () => {
		expect(parseGuestCount('', field).error).toBe('Guest count is required');
		expect(parseGuestCount('15.5', field).count).toBeNull();
		expect(parseGuestCount('14', field).error).toBe('Enter at least 15 guests');
		expect(parseGuestCount('10001', field).count).toBeNull();
	});
});
