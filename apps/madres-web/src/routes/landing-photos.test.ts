import { expect, test } from 'vitest';
import type { GalleryTile } from '$lib/server/presentation-service/gallery.server.js';
import { landingPhotoTiles } from './landing-photos.js';

const image = {
	mediaType: 'IMAGE' as const,
	smallUrl: '/small.webp',
	largeUrl: '/large.webp',
	largeWidth: 600,
	largeHeight: 800,
	videoUrl: null,
	videoWidth: null,
	videoHeight: null
};
const video = { ...image, mediaType: 'VIDEO' as const, videoUrl: '/video.mp4' };

test('keeps one tile per post with photo slides only, in Knurl order', () => {
	const tiles: GalleryTile[] = [
		{ id: 'video', mediaType: 'VIDEO', caption: null, permalink: '/video', mediaItems: [video] },
		{
			id: 'album',
			mediaType: 'CAROUSEL_ALBUM',
			caption: 'Photos',
			permalink: '/album',
			mediaItems: [video, image, { ...image, smallUrl: '/second-small.webp' }]
		},
		{ id: 'single', mediaType: 'IMAGE', caption: null, permalink: '/single', mediaItems: [image] }
	];

	const result = landingPhotoTiles(tiles);
	expect(result.map((tile) => tile.id)).toEqual(['album', 'single']);
	expect(result[0].mediaType).toBe('CAROUSEL_ALBUM');
	expect(result[0].mediaItems.map((item) => item.smallUrl)).toEqual([
		'/small.webp',
		'/second-small.webp'
	]);
	expect(result[1].mediaType).toBe('IMAGE');
});

test('returns no tiles when the gallery is empty or has only video posts', () => {
	expect(landingPhotoTiles([])).toEqual([]);
	expect(
		landingPhotoTiles([
			{ id: 'video', mediaType: 'VIDEO', caption: null, permalink: '/video', mediaItems: [video] }
		])
	).toEqual([]);
});
