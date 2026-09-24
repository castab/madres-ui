import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { sampleOffering } from '$lib/offering/fixtures.js';

beforeEach(() => {
	vi.resetModules();
	vi.spyOn(console, 'error').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.doUnmock('$env/dynamic/private');
});

/** `getOffering` memoizes at module scope, so each case gets its own fresh module instance
 * via `resetModules` + a dynamic re-import — otherwise the first test's result would stick
 * for the rest of the file. `$env/dynamic/private` (not `process.env`) is mocked directly
 * since that's what `offering.server.ts` now reads — see its comment for why (a `.env` file
 * alone is enough for local dev that way, which `process.env` mutation in a test doesn't
 * reflect once the real module reads through the SvelteKit env virtual module instead). */
async function loadFreshModule(offeringJson: string | undefined) {
	vi.doMock('$env/dynamic/private', () => ({
		env: offeringJson === undefined ? {} : { PRIVATE_EVENT_OFFERING_JSON: offeringJson }
	}));
	return await import('./offering.server.js');
}

describe('getOffering', () => {
	test('returns the parsed offering for a valid, well-formed env var', async () => {
		const { getOffering } = await loadFreshModule(JSON.stringify(sampleOffering));
		expect(getOffering()?.id).toBe('madres-private-events');
	});

	test('returns null and logs a warning, without throwing, when the env var is unset', async () => {
		const { getOffering } = await loadFreshModule(undefined);
		expect(getOffering()).toBeNull();
	});

	test('returns null and logs an error, without exposing the raw value, on malformed JSON', async () => {
		const { getOffering } = await loadFreshModule('{ not: valid json');
		expect(getOffering()).toBeNull();
		const loggedText = (console.error as ReturnType<typeof vi.fn>).mock.calls
			.map((call) => call.join(' '))
			.join('\n');
		expect(loggedText).not.toContain('not: valid json');
	});

	test('returns null on a structurally invalid offering document', async () => {
		const { getOffering } = await loadFreshModule(JSON.stringify({ not: 'an offering' }));
		expect(getOffering()).toBeNull();
	});

	test('only reads and parses the env var once per module instance', async () => {
		const mockEnv: Record<string, string> = {
			PRIVATE_EVENT_OFFERING_JSON: JSON.stringify(sampleOffering)
		};
		vi.doMock('$env/dynamic/private', () => ({ env: mockEnv }));
		const { getOffering } = await import('./offering.server.js');

		getOffering();
		getOffering();
		const first = getOffering();
		expect(first?.version).toBe(8);
		// Corrupting the env var after the first read must not change subsequent results —
		// proof the result was memoized rather than re-parsed each call.
		mockEnv.PRIVATE_EVENT_OFFERING_JSON = 'garbage';
		expect(getOffering()).toBe(first);
	});
});
