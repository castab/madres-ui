import type { GuestCountField } from './types.js';

export type GuestCountResult = { count: number; error?: never } | { count: null; error: string };

/** One validation rule for the live estimate and the authoritative form action. */
export function parseGuestCount(raw: string, field: GuestCountField): GuestCountResult {
	const value = raw.trim();
	if (!value) return { count: null, error: 'Guest count is required' };
	if (!/^\d+$/.test(value)) return { count: null, error: 'Enter a whole number of guests' };
	const count = Number(value);
	if (!Number.isSafeInteger(count)) {
		return { count: null, error: 'Enter a whole number of guests' };
	}
	if (count < 1) {
		return { count: null, error: 'Enter at least 1 guest' };
	}
	if (count > field.maximumGuests) {
		return { count: null, error: `Enter no more than ${field.maximumGuests} guests` };
	}
	return { count };
}
