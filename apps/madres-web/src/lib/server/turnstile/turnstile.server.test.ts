import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// `turnstile.server.ts` reads its secret through `$env/dynamic/private` (matching
// `inquiry-email.server.ts` — see that file for why), so that's what tests must mock.
const mockEnv: Record<string, string | undefined> = {};
vi.mock('$env/dynamic/private', () => ({ env: mockEnv }));

const { verifyTurnstileToken } = await import('./turnstile.server.js');

describe('verifyTurnstileToken', () => {
	beforeEach(() => {
		mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';
	});

	afterEach(() => {
		delete mockEnv.TURNSTILE_SECRET_KEY;
		vi.unstubAllGlobals();
	});

	test('fails closed with "missing-token" when no token is given, without calling fetch', async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);

		const result = await verifyTurnstileToken('');

		expect(result).toEqual({ ok: false, kind: 'missing-token' });
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	test('fails closed with "misconfigured" when the secret key is unset, without calling fetch', async () => {
		delete mockEnv.TURNSTILE_SECRET_KEY;
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);

		const result = await verifyTurnstileToken('a-token');

		expect(result).toEqual({ ok: false, kind: 'misconfigured' });
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	test('succeeds when Cloudflare returns success: true', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ success: true }), {
					status: 200,
					headers: { 'content-type': 'application/json' }
				})
			)
		);

		const result = await verifyTurnstileToken('a-token', '203.0.113.1');

		expect(result).toEqual({ ok: true });
	});

	test('rejects when Cloudflare returns success: false', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				new Response(
					JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }),
					{
						status: 200,
						headers: { 'content-type': 'application/json' }
					}
				)
			)
		);

		const result = await verifyTurnstileToken('a-bad-token');

		expect(result).toEqual({ ok: false, kind: 'rejected' });
	});

	test('rejects when Cloudflare returns a non-success HTTP status', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));

		const result = await verifyTurnstileToken('a-token');

		expect(result).toEqual({ ok: false, kind: 'rejected' });
	});

	test('reports "timeout" when the request aborts due to a timeout', async () => {
		const abortError = new DOMException('The operation timed out.', 'TimeoutError');
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

		const result = await verifyTurnstileToken('a-token');

		expect(result).toEqual({ ok: false, kind: 'timeout' });
	});

	test('reports "network" for any other fetch failure', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

		const result = await verifyTurnstileToken('a-token');

		expect(result).toEqual({ ok: false, kind: 'network' });
	});
});
