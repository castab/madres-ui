import { defineEnvVars } from '@sveltejs/kit/env';

// All variables are dynamic (read at server start, not inlined at build) and optional: an unset
// value becomes '' so the build and app start without an env file. Every integration treats ''
// as "not configured" and fails closed — see `src/lib/server/**`.
export const variables = defineEnvVars({
	PUBLIC_TURNSTILE_SITE_KEY: { public: true, schema: (input) => input ?? '' },
	INQUIRY_RATE_LIMIT_PER_15_MINUTES: { schema: (input) => input ?? '' },
	TURNSTILE_SECRET_KEY: { schema: (input) => input ?? '' },
	PRESENTATION_SERVICE_BASE_URL: { schema: (input) => input ?? '' },
	PRESENTATION_SERVICE_ACCOUNT_ID: { schema: (input) => input ?? '' },
	PRESENTATION_SERVICE_GALLERY_NAME: { schema: (input) => input ?? '' },
	PRESENTATION_SERVICE_TRACKING_TOKEN: { schema: (input) => input ?? '' },
	PRIVATE_EVENT_OFFERING_JSON: { schema: (input) => input ?? '' },
	RESEND_API_KEY: { schema: (input) => input ?? '' },
	RESEND_FROM_EMAIL: { schema: (input) => input ?? '' },
	RESEND_TO_EMAIL: { schema: (input) => input ?? '' },
	INQUIRY_DEV_ALLOWED_EMAIL: { schema: (input) => input ?? '' }
});
