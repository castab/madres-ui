import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { env as publicEnv } from '$env/dynamic/public';
import { getOffering } from '$lib/server/offering/offering.server.js';
import { sendInquiryNotification } from '$lib/server/email/inquiry-email.server.js';
import { verifyTurnstileToken } from '$lib/server/turnstile/turnstile.server.js';
import { computeEstimate } from '$lib/offering/estimator.js';
import type { Offering, Selections } from '$lib/offering/types.js';
import type { Actions, PageServerLoad } from './$types.js';

/** One shape across every `fail()` outcome so `+page.svelte` can read `form?.field` without a
 * discriminated-union dance in the template. A successful submission never reaches the page —
 * it redirects to `/inquire/sent` instead. */
type InquireActionResult = {
	success: boolean;
	formError?: string;
	fieldErrors?: Partial<Record<'name' | 'email' | 'zip', string[]>>;
	selectionIssues?: string[];
	values?: { name: string; email: string; zip: string };
};

export const load: PageServerLoad = async () => {
	return {
		offering: getOffering(),
		// `$env/dynamic/public` (not `static/public`) so the build doesn't hard-fail when this
		// isn't set — e.g. in CI, which has no env file at all. An empty site key means the
		// widget itself fails to render/resolve, so the (already-required) client and server
		// Turnstile checks fail closed the same way a missing `TURNSTILE_SECRET_KEY` does.
		turnstileSiteKey: publicEnv.PUBLIC_TURNSTILE_SITE_KEY ?? ''
	};
};

const customerInfoSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
	zip: z.string().trim().min(1, 'ZIP code is required')
});

function describeSelectionLimit(minSelections: number, maxSelections: number): string {
	if (minSelections === maxSelections) return `choose exactly ${minSelections}`;
	if (minSelections === 0) return `choose up to ${maxSelections}`;
	return `choose between ${minSelections} and ${maxSelections}`;
}

/** Re-validates the submitted option ids against the server's own loaded offering — the
 * client-side min/max enforcement in `category-section.svelte` is UX only. */
function validateSelections(offering: Offering, selections: Selections): string[] {
	const issues: string[] = [];
	for (const [categoryKey, category] of Object.entries(offering.categories)) {
		const picked = [...new Set(selections[categoryKey] ?? [])];
		const validOptionIds = new Set(category.options.map((option) => option.id));
		if (picked.some((id) => !validOptionIds.has(id))) {
			issues.push(`${category.label}: contains an unrecognized selection`);
			continue;
		}
		if (picked.length < category.minSelections || picked.length > category.maxSelections) {
			issues.push(
				`${category.label}: ${describeSelectionLimit(category.minSelections, category.maxSelections)}`
			);
		}
	}
	return issues;
}

export const actions: Actions = {
	default: async ({ request, getClientAddress }) => {
		const offering = getOffering();
		if (!offering) {
			return fail(503, {
				success: false,
				formError: 'The inquiry form is currently unavailable.'
			} satisfies InquireActionResult);
		}

		const formData = await request.formData();

		const turnstileToken = String(formData.get('cf-turnstile-response') ?? '');
		const turnstileResult = await verifyTurnstileToken(turnstileToken, getClientAddress());
		if (!turnstileResult.ok) {
			return fail(400, {
				success: false,
				formError: 'Please complete the verification challenge and try again.'
			} satisfies InquireActionResult);
		}

		const customerResult = customerInfoSchema.safeParse({
			name: formData.get('name'),
			email: formData.get('email'),
			zip: formData.get('zip')
		});
		const additionalNotes = String(formData.get('additionalNotes') ?? '').trim();

		const selections: Selections = {};
		for (const categoryKey of Object.keys(offering.categories)) {
			selections[categoryKey] = formData.getAll(categoryKey).map(String);
		}
		const selectionIssues = validateSelections(offering, selections);

		if (!customerResult.success || selectionIssues.length > 0) {
			return fail(400, {
				success: false,
				fieldErrors: customerResult.success ? {} : z.flattenError(customerResult.error).fieldErrors,
				selectionIssues,
				values: {
					name: String(formData.get('name') ?? ''),
					email: String(formData.get('email') ?? ''),
					zip: String(formData.get('zip') ?? '')
				}
			} satisfies InquireActionResult);
		}

		// The browser-side estimate shown while filling out the form is UX only — this is the
		// authoritative, server-recomputed estimate that gets recorded with the inquiry.
		const estimate = computeEstimate(offering, selections);

		const sendResult = await sendInquiryNotification({
			customer: customerResult.data,
			offering,
			selections,
			estimate,
			additionalNotes
		});
		if (!sendResult.ok) {
			return fail(502, {
				success: false,
				formError: 'Something went wrong sending your inquiry. Please try again.'
			} satisfies InquireActionResult);
		}

		redirect(303, '/inquire/sent');
	}
};
