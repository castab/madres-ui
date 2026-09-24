import { env } from '$env/dynamic/private';

const WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_LIMIT = 5;
const MAX_TRACKED_ADDRESSES = 10_000;

type AttemptWindow = { count: number; expiresAt: number };
const attempts = new Map<string, AttemptWindow>();

function configuredLimit(): number {
	const value = env.INQUIRY_RATE_LIMIT_PER_15_MINUTES?.trim();
	if (!value || !/^[1-9]\d*$/.test(value)) return DEFAULT_LIMIT;
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) ? parsed : DEFAULT_LIMIT;
}

function discardExpired(now: number): void {
	for (const [address, window] of attempts) {
		if (window.expiresAt <= now) attempts.delete(address);
	}
}

/** Counts attempts before Turnstile and email work. State is local to this Node process. */
export function checkInquiryRateLimit(
	address: string,
	now = Date.now()
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
	const limit = configuredLimit();
	const current = attempts.get(address);

	if (current && current.expiresAt > now) {
		if (current.count >= limit) {
			return { allowed: false, retryAfterSeconds: Math.ceil((current.expiresAt - now) / 1000) };
		}
		current.count += 1;
		return { allowed: true };
	}

	if (attempts.size >= MAX_TRACKED_ADDRESSES) discardExpired(now);
	if (attempts.size >= MAX_TRACKED_ADDRESSES && !attempts.has(address)) {
		// Bound memory even when an attacker rotates through many source addresses.
		return { allowed: false, retryAfterSeconds: Math.ceil(WINDOW_MS / 1000) };
	}

	attempts.set(address, { count: 1, expiresAt: now + WINDOW_MS });
	return { allowed: true };
}
