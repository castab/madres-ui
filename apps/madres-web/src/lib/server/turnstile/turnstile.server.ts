import { env } from '$env/dynamic/private';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const REQUEST_TIMEOUT_MS = 10_000;

export type VerifyTurnstileResult =
	| { ok: true }
	| { ok: false; kind: 'misconfigured' | 'missing-token' | 'timeout' | 'network' | 'rejected' };

function turnstileSecretKey(): string | null {
	const value = env.TURNSTILE_SECRET_KEY?.trim();
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

/**
 * Verifies a Turnstile widget token against Cloudflare's `/siteverify` API before the /inquire
 * form action does any further work. Fails closed (no fetch attempted, no throw) if
 * `TURNSTILE_SECRET_KEY` isn't configured or `token` is empty — a single attempt, no retry loop,
 * matching this repo's other external integrations (see `presentation-service/transport.server.ts`
 * and `email/inquiry-email.server.ts`).
 */
export async function verifyTurnstileToken(
	token: string,
	remoteIp?: string
): Promise<VerifyTurnstileResult> {
	if (!token) {
		return { ok: false, kind: 'missing-token' };
	}

	const secretKey = turnstileSecretKey();
	if (!secretKey) {
		console.error('Turnstile is not configured — the inquiry submission was rejected');
		return { ok: false, kind: 'misconfigured' };
	}

	const body = new URLSearchParams({ secret: secretKey, response: token });
	if (remoteIp) body.set('remoteip', remoteIp);

	try {
		const response = await fetch(SITEVERIFY_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body,
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		});

		if (!response.ok) {
			console.error('Turnstile siteverify returned a non-success status', {
				status: response.status
			});
			return { ok: false, kind: 'rejected' };
		}

		const result = (await response.json()) as { success?: boolean };
		if (result.success !== true) {
			return { ok: false, kind: 'rejected' };
		}

		return { ok: true };
	} catch (error) {
		const kind = timedOut(error) ? 'timeout' : 'network';
		console.error('Turnstile siteverify request failed', { kind });
		return { ok: false, kind };
	}
}
