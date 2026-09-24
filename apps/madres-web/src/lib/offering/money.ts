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
