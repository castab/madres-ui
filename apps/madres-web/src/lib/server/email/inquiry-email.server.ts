import { env } from '$env/dynamic/private';
import { formatCents } from '$lib/offering/money.js';
import type { Estimate, Offering, Selections } from '$lib/offering/types.js';

const RESEND_API_URL = 'https://api.resend.com/emails';
const REQUEST_TIMEOUT_MS = 15_000;

export type InquiryCustomer = { name: string; email: string; zip: string };

export type SendInquiryNotificationInput = {
	customer: InquiryCustomer;
	offering: Offering;
	selections: Selections;
	estimate: Estimate;
	additionalNotes: string;
};

export type SendInquiryNotificationResult =
	| { ok: true }
	| { ok: false; kind: 'misconfigured' | 'blocked' | 'timeout' | 'network' | 'rejected' };

function resendApiKey(): string | null {
	const value = env.RESEND_API_KEY?.trim();
	return value ? value : null;
}

function resendFromEmail(): string | null {
	const value = env.RESEND_FROM_EMAIL?.trim();
	return value ? value : null;
}

function resendToEmail(): string | null {
	const value = env.RESEND_TO_EMAIL?.trim();
	return value ? value : null;
}

/** Dev-only safety gate: when set, only a submission whose patron-entered email matches this
 * (case-insensitively) is allowed through — every other email fails closed, with no send
 * attempted. Unset (the default, and how production must be configured) disables the gate
 * entirely — every submission is allowed through, unrestricted. */
function devAllowedEmail(): string | null {
	const value = env.INQUIRY_DEV_ALLOWED_EMAIL?.trim();
	return value ? value : null;
}

function timedOut(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'name' in error &&
		typeof error.name === 'string' &&
		['AbortError', 'TimeoutError'].includes(error.name)
	);
}

/** Plain-text summary of everything the patron picked — used as the notification email body.
 * Pure/testable on its own: every label comes from `offering`, never a raw option id. */
export function formatInquiryEmailText(
	offering: Offering,
	customer: InquiryCustomer,
	selections: Selections,
	estimate: Estimate,
	additionalNotes: string
): string {
	const lines: string[] = [
		'New private-event catering inquiry',
		'',
		`Name: ${customer.name}`,
		`Email: ${customer.email}`,
		`ZIP: ${customer.zip}`,
		`Guest Count: ${estimate.guestCount}`,
		''
	];

	for (const [categoryKey, category] of Object.entries(offering.categories)) {
		const selectedIds = selections[categoryKey] ?? [];
		const optionsById = new Map(category.options.map((option) => [option.id, option]));
		const selectedLabels = selectedIds
			.map((id) => optionsById.get(id)?.label)
			.filter((label): label is string => Boolean(label));
		lines.push(
			`${category.label}: ${selectedLabels.length > 0 ? selectedLabels.join(', ') : 'None selected'}`
		);
	}

	if (additionalNotes.trim()) {
		lines.push('', 'Anything else:', additionalNotes.trim());
	}

	if (estimate.minimumAdjustmentCents > 0) {
		lines.push(
			'',
			`Serving style minimum adjustment (to ${formatCents(estimate.minimumEventCents, offering.currency)}): ${formatCents(estimate.minimumAdjustmentCents, offering.currency)}`
		);
	}

	lines.push(
		'',
		`Estimated total: ${formatCents(estimate.totalCents, offering.currency)}`,
		'',
		`Offering: ${offering.id} v${offering.version}`
	);

	return lines.join('\n');
}

/**
 * Sends the staff notification email for a validated inquiry via Resend's HTTP API.
 * Fails closed (no fetch attempted) if `RESEND_API_KEY`/`RESEND_FROM_EMAIL`/`RESEND_TO_EMAIL`
 * aren't configured, or if `INQUIRY_DEV_ALLOWED_EMAIL` is set and the patron's email doesn't
 * match it — and never throws — a single attempt, no retry loop, matching this repo's other
 * external integrations (see `presentation-service/transport.server.ts`). A patron who sees
 * the resulting error can just resubmit the form, which is the retry path.
 */
export async function sendInquiryNotification({
	customer,
	offering,
	selections,
	estimate,
	additionalNotes
}: SendInquiryNotificationInput): Promise<SendInquiryNotificationResult> {
	const allowedEmail = devAllowedEmail();
	if (allowedEmail && customer.email.trim().toLowerCase() !== allowedEmail.toLowerCase()) {
		console.warn('Inquiry blocked by INQUIRY_DEV_ALLOWED_EMAIL gate — no email was sent');
		return { ok: false, kind: 'blocked' };
	}

	const apiKey = resendApiKey();
	const fromEmail = resendFromEmail();
	const toEmail = resendToEmail();
	if (!apiKey || !fromEmail || !toEmail) {
		console.error('Resend is not configured — the inquiry notification email was not sent');
		return { ok: false, kind: 'misconfigured' };
	}

	try {
		const response = await fetch(RESEND_API_URL, {
			method: 'POST',
			headers: {
				authorization: `Bearer ${apiKey}`,
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				from: fromEmail,
				to: toEmail,
				reply_to: customer.email,
				subject: `New private-event inquiry — ${customer.name}`,
				text: formatInquiryEmailText(offering, customer, selections, estimate, additionalNotes)
			}),
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		});

		if (!response.ok) {
			console.error('Resend rejected the inquiry notification email', {
				status: response.status
			});
			return { ok: false, kind: 'rejected' };
		}

		return { ok: true };
	} catch (error) {
		const kind = timedOut(error) ? 'timeout' : 'network';
		console.error('Sending the inquiry notification email failed', { kind });
		return { ok: false, kind };
	}
}
