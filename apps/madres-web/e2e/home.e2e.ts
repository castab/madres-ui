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

test('the hero photo clearly links to the full gallery', async ({ page }) => {
	await page.goto('/');
	const heroGalleryLink = page.getByRole('link', { name: 'View gallery', exact: true });
	await expect(heroGalleryLink).toHaveAttribute('href', '/gallery');
	await expect(heroGalleryLink.locator('img')).toHaveAttribute(
		'src',
		'/images/photo-buffet-spread.png'
	);
	await heroGalleryLink.click();
	await expect(page).toHaveURL('/gallery');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'A Few Favorites From Recent Events'
	);
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

test('curated landing photos use small images, warm large covers, and open the photo lightbox', async ({
	page
}) => {
	const largeRequests: string[] = [];
	const trackingRequests: Array<{ id: string; event: string }> = [];
	page.on('request', (request) => {
		if (request.url().endsWith('/large.webp')) largeRequests.push(request.url());
		if (request.url().endsWith('/landing/track')) {
			trackingRequests.push(request.postDataJSON());
		}
	});
	await page.route('**/e2e/**', (route) =>
		route.fulfill({
			contentType: 'image/png',
			body: Buffer.from(
				'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y3UO6sAAAAASUVORK5CYII=',
				'base64'
			)
		})
	);

	await page.goto('/');
	const photos = page.locator('section').filter({
		has: page.getByRole('heading', { name: 'Moments worth sharing' })
	});
	await expect(photos.getByRole('button', { name: /^View photo/ })).toHaveCount(2);
	await expect(photos.locator('img').first()).toHaveAttribute('src', /small\.webp/);
	await expect.poll(() => largeRequests.length).toBe(2);
	const testimonial = page.locator('section').filter({ hasText: 'Our guests are still talking' });
	await expect(testimonial).toBeVisible();
	expect(await photos.evaluate((node) => getComputedStyle(node).backgroundColor)).toBe(
		await testimonial.evaluate((node) => getComputedStyle(node).backgroundColor)
	);
	await expect(photos.getByRole('link', { name: 'View full gallery' })).toHaveAttribute(
		'href',
		'/gallery'
	);
	expect(
		await testimonial.evaluate(
			(node) =>
				node.nextElementSibling?.querySelector('h2')?.textContent === 'Moments worth sharing'
		)
	).toBe(true);

	await photos.getByRole('button', { name: /^View photo 1/ }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.locator('img[src*="post-1/large.webp"]')).toBeVisible();
	await page.keyboard.press('ArrowRight');
	await expect(dialog.locator('img[src*="post-carousel/0/large.webp"]')).toBeVisible();
	await page.keyboard.press('ArrowRight');
	await expect(dialog.locator('img[src*="post-carousel/2/large.webp"]')).toBeVisible();
	await expect(dialog.locator('video')).toHaveCount(0);
	await expect
		.poll(() => trackingRequests.map((request) => request.id))
		.toEqual(['e2e-post-1', 'e2e-post-carousel']);
	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);
});
