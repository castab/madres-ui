import type { GalleryTile } from '$lib/server/presentation-service/gallery.server.js';

/** Keep one tile per post and retain only photo slides in its lightbox. */
export function landingPhotoTiles(tiles: GalleryTile[]): GalleryTile[] {
	return tiles.flatMap((tile) => {
		const mediaItems = tile.mediaItems.filter((item) => item.mediaType === 'IMAGE');
		if (mediaItems.length === 0) return [];
		return [{ ...tile, mediaType: mediaItems.length > 1 ? 'CAROUSEL_ALBUM' : 'IMAGE', mediaItems }];
	});
}
