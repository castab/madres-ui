import { getOffering } from '$lib/server/offering/offering.server.js';
import type { LayoutServerLoad } from './$types.js';

/** Runs for every page. `offeringAvailable` doubles as a pseudo feature flag: every
 * inquiry-related nav item/CTA across the site checks this instead of its own copy of
 * `getOffering()`, so an unset/malformed `PRIVATE_EVENT_OFFERING_JSON` hides the feature
 * everywhere rather than only failing on `/inquire` itself. */
export const load: LayoutServerLoad = async () => {
	return { offeringAvailable: getOffering() !== null };
};
