/** Formats integer cents as a currency string, omitting decimals for whole-dollar amounts
 * (`$300`, not `$300.00`) to match the estimate breakdown's presentation. */
export function formatCents(cents: number, currency: string): string {
	const isWholeDollars = cents % 100 === 0;
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: isWholeDollars ? 0 : 2,
		maximumFractionDigits: isWholeDollars ? 0 : 2
	}).format(cents / 100);
}

/** Formats a low/high cents pair as a range ("$4,550 – $9,100"), or a single amount when the
 * two ends are equal (an open-ended guest band, or no guest count picked yet). */
export function formatCentsRange(lowCents: number, highCents: number, currency: string): string {
	if (lowCents === highCents) return formatCents(lowCents, currency);
	return `${formatCents(lowCents, currency)} – ${formatCents(highCents, currency)}`;
}

/** Formats a low/high guest-count pair as a range ("25–100"), or a single number when equal. */
export function formatGuestRange(low: number, high: number): string {
	if (low === high) return String(low);
	return `${low}–${high}`;
}
