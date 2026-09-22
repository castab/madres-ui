import { expect, test } from '@playwright/test';

test('the Madres landing page loads and Book stays disabled with a coming-soon toast', async ({
	page
}) => {
	await page.goto('/');

	await expect(page).toHaveTitle('Madres Taco Shop');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Fine dining,');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('catered to you.');

	const bookButton = page.getByRole('button', { name: 'Book an Event' });
	await expect(bookButton).toHaveAttribute('aria-disabled', 'true');
	await bookButton.click({ force: true });
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
