import { defineConfig, devices } from '@playwright/test';

const port = process.env.MADRES_PLAYWRIGHT_PORT ?? '4173';
const presentationServiceMockPort = process.env.PRESENTATION_SERVICE_MOCK_PORT ?? '4030';
const presentationServiceBaseUrl = `http://127.0.0.1:${presentationServiceMockPort}`;

export default defineConfig({
	testDir: './e2e',
	testMatch: '**/*.e2e.{ts,js}',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	use: {
		baseURL: `http://127.0.0.1:${port}`,
		trace: 'on-first-retry'
	},
	projects: [
		{ name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }
	],
	webServer: [
		{
			command: 'node test/presentation-service-mock.mjs',
			url: `${presentationServiceBaseUrl}/__test__/health`,
			reuseExistingServer: !process.env.CI
		},
		{
			command: `npm run build && npm run preview -- --port ${port} --host 127.0.0.1`,
			url: `http://127.0.0.1:${port}`,
			env: {
				PRESENTATION_SERVICE_BASE_URL: presentationServiceBaseUrl,
				PRESENTATION_SERVICE_ACCOUNT_ID: 'e2e-madres-account',
				PRESENTATION_SERVICE_GALLERY_NAME: 'Madres Taco Shop',
				PRESENTATION_SERVICE_TRACKING_TOKEN: 'e2e-presentation-service-tracking-token'
			},
			reuseExistingServer: !process.env.CI
		}
	]
});
