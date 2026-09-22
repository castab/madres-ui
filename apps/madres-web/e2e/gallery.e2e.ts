import { expect, test } from '@playwright/test';

test('the gallery grid renders real posts, paginates with Load more, and opens a lightbox that keyboard navigation can drive', async ({
	page
}) => {
	await page.goto('/gallery');

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'A Few Favorites From Recent Events'
	);

	await expect(page.getByRole('button', { name: /View photo 1 of 2/ })).toBeVisible();
	await page.getByRole('button', { name: 'Load more' }).click();

	const cards = page.getByRole('button', { name: /View (photo|video|album) \d of 3/ });
	await expect(cards).toHaveCount(3);
	await expect(page.getByRole('button', { name: 'Load more' })).toHaveCount(0);
	await expect(page.getByText(/caught up/i)).toBeVisible();

	await cards.first().click();
	await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'View on Instagram' })).toHaveAttribute(
		'href',
		'https://www.instagram.com/p/Cabc123XYZ/'
	);

	await page.keyboard.press('Escape');
	await expect(page.getByRole('button', { name: 'Close' })).toHaveCount(0);
});

test("a carousel post's dots and chevrons move within it before paging to another post, and each slide's own media type drives its badge", async ({
	page
}) => {
	await page.goto('/gallery');

	await page.getByRole('button', { name: 'Load more' }).click();
	await expect(page.getByRole('button', { name: /View (photo|video|album) \d of 3/ })).toHaveCount(
		3
	);

	await page.getByRole('button', { name: /View album \d of 3/ }).click();
	const dialog = page.getByRole('dialog');
	const dots = dialog.getByRole('button', { name: /Go to image \d of 3/ });
	await expect(dots).toHaveCount(3);
	await expect(dots.first()).toHaveAttribute('aria-current', 'true');
	// Slide 1 is an image: no video badge, and no video 2 away is warmed yet.
	await expect(dialog.getByText(/Video/)).toHaveCount(0);
	await expect(dialog.locator('video')).toHaveCount(0);

	// Slide 2 is a VIDEO item with no videoUrl yet — its own mediaType (not the post's, which
	// is CAROUSEL_ALBUM) is what surfaces the processing badge, with no video element mounted
	// for slide 2 itself. Slide 3 (the ready video) is now the adjacent neighbor and gets
	// warmed (preload="auto", same buffering as a current slide) — one <video> exists, but
	// it isn't playing since it isn't current.
	await dots.nth(1).click();
	await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
	await expect(dialog.getByText('Video · Processing')).toBeVisible();
	await expect(dialog.locator('video')).toHaveCount(1);
	await expect(dialog.locator('video[preload="auto"]')).toHaveCount(1);

	// Slide 3 is a ready VIDEO item: it becomes the current, playing video, and the badge
	// reads "Video" instead. Slide 2 (adjacent, but with no videoUrl) still mounts no <video>
	// at all, so it's the only video element in the DOM.
	await dots.nth(2).click();
	await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');
	await expect(dialog.getByText('Video', { exact: true })).toBeVisible();
	await expect(dialog.locator('video')).toHaveCount(1);

	// The fixture's videoUrl points at an unreachable host, so playback never actually starts
	// here — this only checks the controls exist and render an initial, un-started state
	// (real elapsed-time progression isn't exercised by this fixture-backed spec).
	await expect(dialog.getByRole('button', { name: 'Play video' })).toBeVisible();
	await expect(dialog.getByRole('slider', { name: 'Seek video' })).toBeVisible();
	await expect(dialog.getByText(/^\d+:\d{2}\/\d+:\d{2}$/)).toBeVisible();

	// Currently on the carousel's last slide (3 of 3). The Previous chevron traverses the
	// carousel back to its first slide before it pages to the previous post — the same rule
	// desktop/no-touch users get via keyboard, mirroring what touch users already get from
	// swiping.
	await dialog.getByRole('button', { name: 'Previous' }).click();
	await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');

	await dialog.getByRole('button', { name: 'Previous' }).click();
	await expect(dots.first()).toHaveAttribute('aria-current', 'true');

	await dialog.getByRole('button', { name: 'Previous' }).click();
	await expect(page.getByRole('link', { name: 'View on Instagram' })).toHaveAttribute(
		'href',
		'https://www.instagram.com/p/Cabc123XYZ/'
	);
});
