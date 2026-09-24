import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { computeEstimate } from '$lib/offering/estimator.js';
import { sampleOffering } from '$lib/offering/fixtures.js';
import type { Quantities, Selections } from '$lib/offering/types.js';

// `inquiry-email.server.ts` reads secrets through `$env/dynamic/private` (not `process.env`
// directly — see `offering.server.ts` for why), so that's what tests must mock. Unlike
// `getOffering`, `sendInquiryNotification` reads it fresh on every call rather than caching,
// so a single mutable mock object (no per-test module reset) is enough.
const mockEnv: Record<string, string | undefined> = {};
vi.mock('$env/dynamic/private', () => ({ env: mockEnv }));

const { formatInquiryEmailText, sendInquiryNotification } =
	await import('./inquiry-email.server.js');

const customer = { name: 'Jane Diaz', email: 'jane@example.com', zip: '90210' };
const additionalNotes = '';
const selections: Selections = {
	servingStyle: ['buffet'],
	proteins: ['asada', 'pollo'],
	drinks: ['horchata'],
	appetizers: []
};
const quantities: Quantities = {};
const estimate = computeEstimate(sampleOffering, selections, 175);

describe('formatInquiryEmailText', () => {
	test('includes the customer info and every category, selected or not', () => {
		const text = formatInquiryEmailText(
			sampleOffering,
			customer,
			selections,
			quantities,
			estimate,
			additionalNotes
		);

		expect(text).toContain('Name: Jane Diaz');
		expect(text).toContain('Email: jane@example.com');
		expect(text).toContain('ZIP: 90210');
		expect(text).toContain('Guest Count: 175');
		expect(text).toContain('Serving Style: Gourmet Taco Buffet');
		expect(text).toContain('Proteins: Asada, Pollo');
		expect(text).toContain('Drinks: Horchata');
		expect(text).toContain('Appetizers: None selected');
	});

	test('reports one total for the entered guest count', () => {
		const largerEstimate = computeEstimate(sampleOffering, selections, 275);

		const text = formatInquiryEmailText(
			sampleOffering,
			customer,
			selections,
			quantities,
			largerEstimate,
			additionalNotes
		);

		expect(text).toContain('Guest Count: 275');
		expect(text).toContain('Estimated total: $7,975');
	});

	test('includes appetizer counts and their item subtotal', () => {
		const ordered = { appetizers: { flautas: 100, fruit_cup_spread: 25 } };
		const priced = computeEstimate(sampleOffering, selections, 175, ordered);
		const text = formatInquiryEmailText(sampleOffering, customer, selections, ordered, priced, '');
		expect(text).toContain('Appetizers: Flauta en Vaso × 100, Matchstick Fruit × 25');
		expect(text).toContain('Appetizers subtotal: $500');
		expect(text).toContain('Estimated total: $5,575');
	});

	test('explains an event minimum adjustment in the staff notification', () => {
		const smallEstimate = computeEstimate(sampleOffering, selections, 15);
		const text = formatInquiryEmailText(
			sampleOffering,
			customer,
			selections,
			quantities,
			smallEstimate,
			''
		);
		expect(text).toContain('Serving style minimum adjustment (to $1,000): $595');
		expect(text).toContain('Estimated total: $1,030');
	});

	test('includes an "Anything else" section when notes are present', () => {
		const text = formatInquiryEmailText(
			sampleOffering,
			customer,
			selections,
			quantities,
			estimate,
			'Please set up near the pavilion, and one guest has a peanut allergy.'
		);

		expect(text).toContain('Anything else:');
		expect(text).toContain('Please set up near the pavilion, and one guest has a peanut allergy.');
	});

	test('omits the "Anything else" section when notes are empty or whitespace-only', () => {
		const empty = formatInquiryEmailText(
			sampleOffering,
			customer,
			selections,
			quantities,
			estimate,
			''
		);
		const whitespace = formatInquiryEmailText(
			sampleOffering,
			customer,
			selections,
			quantities,
			estimate,
			'   '
		);

		expect(empty).not.toContain('Anything else:');
		expect(whitespace).not.toContain('Anything else:');
	});
});

describe('sendInquiryNotification', () => {
	beforeEach(() => {
		mockEnv.RESEND_API_KEY = 'test-key';
		mockEnv.RESEND_FROM_EMAIL = 'no-reply@mail.madrestacoshop.com';
		mockEnv.RESEND_TO_EMAIL = 'inquire@madrestacoshop.com';
	});

	afterEach(() => {
		delete mockEnv.RESEND_API_KEY;
		delete mockEnv.RESEND_FROM_EMAIL;
		delete mockEnv.RESEND_TO_EMAIL;
		delete mockEnv.INQUIRY_DEV_ALLOWED_EMAIL;
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	test('sends a correctly-shaped request to Resend on success', async () => {
		const fetch = vi.fn().mockResolvedValue(Response.json({ id: 'email-1' }, { status: 200 }));
		vi.stubGlobal('fetch', fetch);

		await expect(
			sendInquiryNotification({
				customer,
				offering: sampleOffering,
				selections,
				quantities,
				estimate,
				additionalNotes
			})
		).resolves.toEqual({ ok: true });

		expect(fetch).toHaveBeenCalledTimes(1);
		const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
		expect(url).toBe('https://api.resend.com/emails');
		expect(init.method).toBe('POST');
		expect(init.headers).toMatchObject({
			authorization: 'Bearer test-key',
			'content-type': 'application/json'
		});
		const body = JSON.parse(init.body as string);
		expect(body).toMatchObject({
			from: 'no-reply@mail.madrestacoshop.com',
			to: 'inquire@madrestacoshop.com',
			reply_to: 'jane@example.com',
			subject: 'New private-event inquiry — Jane Diaz'
		});
		expect(body.text).toContain('Name: Jane Diaz');
	});

	test('carries additionalNotes through into the Resend request body', async () => {
		const fetch = vi.fn().mockResolvedValue(Response.json({ id: 'email-1' }, { status: 200 }));
		vi.stubGlobal('fetch', fetch);

		await sendInquiryNotification({
			customer,
			offering: sampleOffering,
			selections,
			quantities,
			estimate,
			additionalNotes: 'Please set up near the pavilion.'
		});

		const [, init] = fetch.mock.calls[0] as [string, RequestInit];
		const body = JSON.parse(init.body as string);
		expect(body.text).toContain('Anything else:');
		expect(body.text).toContain('Please set up near the pavilion.');
	});

	test.each(['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'RESEND_TO_EMAIL'] as const)(
		'fails closed without calling fetch when %s is not configured',
		async (missingVar) => {
			delete mockEnv[missingVar];
			const fetch = vi.fn();
			vi.stubGlobal('fetch', fetch);
			vi.spyOn(console, 'error').mockImplementation(() => undefined);

			await expect(
				sendInquiryNotification({
					customer,
					offering: sampleOffering,
					selections,
					quantities,
					estimate,
					additionalNotes
				})
			).resolves.toEqual({ ok: false, kind: 'misconfigured' });
			expect(fetch).not.toHaveBeenCalled();
		}
	);

	test('classifies a non-2xx Resend response as rejected', async () => {
		const fetch = vi.fn().mockResolvedValue(new Response('bad request', { status: 422 }));
		vi.stubGlobal('fetch', fetch);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(
			sendInquiryNotification({
				customer,
				offering: sampleOffering,
				selections,
				quantities,
				estimate,
				additionalNotes
			})
		).resolves.toEqual({ ok: false, kind: 'rejected' });
	});

	test('classifies a timeout and never retries', async () => {
		const fetch = vi.fn().mockRejectedValue(new DOMException('timed out', 'TimeoutError'));
		vi.stubGlobal('fetch', fetch);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(
			sendInquiryNotification({
				customer,
				offering: sampleOffering,
				selections,
				quantities,
				estimate,
				additionalNotes
			})
		).resolves.toEqual({ ok: false, kind: 'timeout' });
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	test('classifies a network error', async () => {
		const fetch = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
		vi.stubGlobal('fetch', fetch);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(
			sendInquiryNotification({
				customer,
				offering: sampleOffering,
				selections,
				quantities,
				estimate,
				additionalNotes
			})
		).resolves.toEqual({ ok: false, kind: 'network' });
	});

	test('INQUIRY_DEV_ALLOWED_EMAIL unset allows any patron email through', async () => {
		const fetch = vi.fn().mockResolvedValue(Response.json({ id: 'email-1' }, { status: 200 }));
		vi.stubGlobal('fetch', fetch);

		await expect(
			sendInquiryNotification({
				customer,
				offering: sampleOffering,
				selections,
				quantities,
				estimate,
				additionalNotes
			})
		).resolves.toEqual({ ok: true });
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	test('INQUIRY_DEV_ALLOWED_EMAIL blocks a non-matching patron email without calling fetch', async () => {
		mockEnv.INQUIRY_DEV_ALLOWED_EMAIL = 'tester@example.com';
		const fetch = vi.fn();
		vi.stubGlobal('fetch', fetch);
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		await expect(
			sendInquiryNotification({
				customer,
				offering: sampleOffering,
				selections,
				quantities,
				estimate,
				additionalNotes
			})
		).resolves.toEqual({ ok: false, kind: 'blocked' });
		expect(fetch).not.toHaveBeenCalled();
	});

	test('INQUIRY_DEV_ALLOWED_EMAIL allows a case-insensitive match through', async () => {
		mockEnv.INQUIRY_DEV_ALLOWED_EMAIL = 'JANE@EXAMPLE.COM';
		const fetch = vi.fn().mockResolvedValue(Response.json({ id: 'email-1' }, { status: 200 }));
		vi.stubGlobal('fetch', fetch);

		await expect(
			sendInquiryNotification({
				customer,
				offering: sampleOffering,
				selections,
				quantities,
				estimate,
				additionalNotes
			})
		).resolves.toEqual({ ok: true });
		expect(fetch).toHaveBeenCalledTimes(1);
	});
});
