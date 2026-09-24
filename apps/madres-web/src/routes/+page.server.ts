import { getGalleryPage } from '$lib/server/presentation-service/gallery.server.js';
import { landingPhotoTiles } from './landing-photos.js';
import type { PageServerLoad } from './$types.js';

// Knurl's media URLs can expire, so the landing page must fetch them per request.
export const prerender = false;

export const load: PageServerLoad = async () => {
	const page = await getGalleryPage(1, 'landing');
	return { landingPhotos: landingPhotoTiles(page.tiles) };
};
