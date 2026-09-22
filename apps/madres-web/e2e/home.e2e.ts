import { expect, test } from '@playwright/test';

test('the Madres landing page loads and Inquire stays disabled with a coming-soon toast until the offering is configured', async ({
	page
}) => {
	await page.goto('/');

	await expect(page).toHaveTitle('Madres Taco Shop');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Fine dining,');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('catered to you.');

	// PRIVATE_EVENT_OFFERING_JSON isn't set in CI, so /inquire is treated as unconfigured and
	// every inquiry CTA — including this hero button — falls back to the disabled toast state.
	// The hero and the page-bottom CTA share the "Inquire" label, so take the first (hero) one.
	const inquireButton = page.getByRole('button', { name: 'Inquire' }).first();
	await expect(inquireButton).toHaveAttribute('aria-disabled', 'true');
	await inquireButton.click({ force: true });
	await expect(page.getByText('Online booking is coming soon')).toBeVisible();
	await expect(page).toHaveURL('/');
});

test('the page fits its viewport and the mobile navigation is operable', async ({
	page
}, testInfo) => {
	await page.goto('/');
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
		await page.evaluate(() => window.innerWidth)
	);

	if (testInfo.project.use.isMobile) {
		await page.getByRole('button', { name: 'Open navigation' }).click();
		const closeButton = page.getByRole('button', { name: 'Close navigation' });
		await expect(closeButton).toHaveAttribute('aria-expanded', 'true');
		await expect(
			page
				.getByRole('navigation', { name: 'Mobile navigation' })
				.getByRole('link', { name: 'Gallery' })
		).toHaveAttribute('href', '/gallery');
	}
});
