import { env } from '$env/dynamic/private';
import { parseOffering } from '$lib/offering/schema.js';
import type { Offering } from '$lib/offering/types.js';

let cached: Offering | null | undefined;

function loadOffering(): Offering | null {
	// `$env/dynamic/private` (not `process.env` directly): during `vite dev` it's populated
	// from `.env` files too, not only real shell/OS env vars, so a `.env` file alone is
	// enough for local dev. In production it still reads the real runtime `process.env` at
	// server start (adapter-node wires this up), so Railway env vars work exactly as before.
	const raw = env.PRIVATE_EVENT_OFFERING_JSON?.trim();
	if (!raw) {
		console.warn(
			'PRIVATE_EVENT_OFFERING_JSON is not set — the private-event inquiry form is disabled'
		);
		return null;
	}

	let parsedJson: unknown;
	try {
		parsedJson = JSON.parse(raw);
	} catch {
		// Never log the raw value: even though this offering is not secret, keeping env
		// parsing deliberately quiet about its contents avoids leaking config shape/values
		// into logs by habit.
		console.error(
			'PRIVATE_EVENT_OFFERING_JSON is not valid JSON — the private-event inquiry form is disabled'
		);
		return null;
	}

	const result = parseOffering(parsedJson);
	if (!result.ok) {
		console.error(
			'PRIVATE_EVENT_OFFERING_JSON failed validation — the private-event inquiry form is disabled',
			{
				issues: result.issues
			}
		);
		return null;
	}

	return result.offering;
}

/**
 * Returns the validated private-event offering, or `null` if
 * `PRIVATE_EVENT_OFFERING_JSON` is missing, malformed, or invalid — never throws. The
 * env var is only ever read/parsed/validated once per process (it can't change without a
 * restart — see `.env.example`), so this also doubles as the app-wide "is the inquiry
 * feature on" check without repeating the parse or the error log on every request.
 */
export function getOffering(): Offering | null {
	if (cached === undefined) cached = loadOffering();
	return cached;
}
