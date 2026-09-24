import { afterEach, describe, expect, test, vi } from 'vitest';

const mockEnv: Record<string, string | undefined> = {};
vi.mock('$env/dynamic/private', () => ({ env: mockEnv }));

const { checkInquiryRateLimit } = await import('./inquiry-rate-limit.server.js');

describe('checkInquiryRateLimit', () => {
	afterEach(() => {
		delete mockEnv.INQUIRY_RATE_LIMIT_PER_15_MINUTES;
	});

	test('allows five attempts per address, then returns a retry time', () => {
		for (let attempt = 0; attempt < 5; attempt += 1) {
			expect(checkInquiryRateLimit('192.0.2.1', 0)).toEqual({ allowed: true });
		}
		expect(checkInquiryRateLimit('192.0.2.1', 1000)).toEqual({
			allowed: false,
			retryAfterSeconds: 899
		});
		expect(checkInquiryRateLimit('192.0.2.2', 1000)).toEqual({ allowed: true });
		expect(checkInquiryRateLimit('192.0.2.1', 900_000)).toEqual({ allowed: true });
	});

	test('uses a valid runtime override and falls back for invalid values', () => {
		mockEnv.INQUIRY_RATE_LIMIT_PER_15_MINUTES = '2';
		expect(checkInquiryRateLimit('192.0.2.3', 0)).toEqual({ allowed: true });
		expect(checkInquiryRateLimit('192.0.2.3', 0)).toEqual({ allowed: true });
		expect(checkInquiryRateLimit('192.0.2.3', 0).allowed).toBe(false);

		mockEnv.INQUIRY_RATE_LIMIT_PER_15_MINUTES = '0';
		for (let attempt = 0; attempt < 5; attempt += 1) {
			expect(checkInquiryRateLimit('192.0.2.4', 0)).toEqual({ allowed: true });
		}
		expect(checkInquiryRateLimit('192.0.2.4', 0).allowed).toBe(false);
	});
});
