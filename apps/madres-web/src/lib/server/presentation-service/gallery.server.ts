import {
	presentationServiceAccountId,
	presentationServiceGalleryName,
	presentationServiceTrackingToken,
	readPresentationServiceJson,
	requestPresentationService
} from './transport.server.js';

const GALLERY_READ_TIMEOUT_MS = 3_000;
const GALLERY_TRACK_TIMEOUT_MS = 3_000;
const GALLERY_ID_CACHE_MS = 5 * 60_000;

export type GalleryMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

/** A media item's own type, independent of its post's `GalleryMediaType` (which for a
 * `CAROUSEL_ALBUM` post says nothing about any individual item). A video whose asset hasn't
 * finished processing can be `"VIDEO"` with `videoUrl` still null. */
export type GalleryItemMediaType = 'IMAGE' | 'VIDEO';

export type GalleryMediaItem = {
	mediaType: GalleryItemMediaType;
	smallUrl: string;
	largeUrl: string;
	/** Pixel dimensions of `largeUrl` — knurl's own decoded size of that variant, not a hint.
	 * Used to size the lightbox to this item's real aspect ratio instead of a fixed box that
	 * would letterbox most non-square content (most of this account's photos are portrait). */
	largeWidth: number;
	largeHeight: number;
	videoUrl: string | null;
	/** Present exactly when `videoUrl` is — the video's own dimensions, which can differ from
	 * `largeWidth`/`largeHeight` (the poster image's size). */
	videoWidth: number | null;
	videoHeight: number | null;
};

/** One post. `mediaItems` holds every item in knurl's own order (a `CAROUSEL_ALBUM` post
 * has more than one; a single photo/video always has exactly one). */
export type GalleryTile = {
	id: string;
	mediaType: GalleryMediaType;
	caption: string | null;
	permalink: string;
	mediaItems: GalleryMediaItem[];
};

export type GalleryTrackingEvent = 'view' | 'click';

/** One page of gallery posts, per knurl's `{ data, pagination }` envelope. `hasNextPage` is
 * derived from `currentPage`/`totalPages` rather than exposing knurl's full pagination shape
 * (total record counts, link URLs) that this app has no use for. */
export type GalleryPage = {
	tiles: GalleryTile[];
	currentPage: number;
	hasNextPage: boolean;
};

const EMPTY_PAGE: GalleryPage = { tiles: [], currentPage: 1, hasNextPage: false };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringAt(value: Record<string, unknown>, key: string): string | null {
	return typeof value[key] === 'string' ? (value[key] as string) : null;
}

function numberAt(value: Record<string, unknown>, key: string): number | null {
	return typeof value[key] === 'number' ? (value[key] as number) : null;
}

function nullableStringAt(value: Record<string, unknown>, key: string): string | null | undefined {
	const field = value[key];
	if (field === null) return null;
	return typeof field === 'string' ? field : undefined;
}

function nullableNumberAt(value: Record<string, unknown>, key: string): number | null | undefined {
	const field = value[key];
	if (field === null) return null;
	return typeof field === 'number' ? field : undefined;
}

function arrayAt(value: Record<string, unknown>, key: string): unknown[] | null {
	return Array.isArray(value[key]) ? (value[key] as unknown[]) : null;
}

function parseMediaType(value: unknown): GalleryMediaType | null {
	if (value === 'IMAGE' || value === 'VIDEO' || value === 'CAROUSEL_ALBUM') return value;
	return null;
}

function parseItemMediaType(value: unknown): GalleryItemMediaType | null {
	if (value === 'IMAGE' || value === 'VIDEO') return value;
	return null;
}

function parseMediaItem(value: unknown): GalleryMediaItem | null {
	if (!isRecord(value)) return null;
	const mediaType = parseItemMediaType(value.mediaType);
	const smallUrl = stringAt(value, 'smallUrl');
	const largeUrl = stringAt(value, 'largeUrl');
	const largeWidth = numberAt(value, 'largeWidth');
	const largeHeight = numberAt(value, 'largeHeight');
	const videoUrl = nullableStringAt(value, 'videoUrl');
	const videoWidth = nullableNumberAt(value, 'videoWidth');
	const videoHeight = nullableNumberAt(value, 'videoHeight');
	if (
		!mediaType ||
		!smallUrl ||
		!largeUrl ||
		largeWidth === null ||
		largeHeight === null ||
		videoUrl === undefined ||
		videoWidth === undefined ||
		videoHeight === undefined
	) {
		return null;
	}
	return {
		mediaType,
		smallUrl,
		largeUrl,
		largeWidth,
		largeHeight,
		videoUrl,
		videoWidth,
		videoHeight
	};
}

function parseTile(value: unknown): GalleryTile | null {
	if (!isRecord(value)) return null;
	const id = stringAt(value, 'id');
	const mediaType = parseMediaType(value.mediaType);
	const permalink = stringAt(value, 'permalink');
	const caption = nullableStringAt(value, 'caption');
	const rawMediaItems = arrayAt(value, 'mediaItems');
	if (!id || !mediaType || !permalink || caption === undefined || !rawMediaItems) return null;

	const mediaItems: GalleryMediaItem[] = [];
	for (const rawItem of rawMediaItems) {
		const item = parseMediaItem(rawItem);
		if (item) mediaItems.push(item);
	}
	if (mediaItems.length === 0) return null;

	return { id, mediaType, caption, permalink, mediaItems };
}

export function parseGalleryPage(payload: unknown): GalleryPage | null {
	if (!isRecord(payload)) return null;
	const data = arrayAt(payload, 'data');
	const pagination = payload.pagination;
	if (!data || !isRecord(pagination)) return null;

	const currentPage = numberAt(pagination, 'currentPage');
	const totalPages = numberAt(pagination, 'totalPages');
	if (currentPage === null || totalPages === null) return null;

	const tiles: GalleryTile[] = [];
	for (const item of data) {
		const tile = parseTile(item);
		if (tile) tiles.push(tile);
	}
	return { tiles, currentPage, hasNextPage: currentPage < totalPages };
}

/**
 * Never throws. Returns an empty, terminal page when unconfigured, unreachable, or
 * malformed — the gallery page treats that identically to "no posts yet", and a failed
 * "load more" simply stops offering further pages rather than surfacing an error.
 *
 * `page` is 1-based, matching knurl's own convention. `limit` is deliberately omitted:
 * knurl defaults it to 12 and clamps it into 1..50, and that per-page size is knurl's
 * call to make, not this app's — see `AGENTS.md`.
 */
export async function getGalleryPage(page: number = 1): Promise<GalleryPage> {
	const accountId = presentationServiceAccountId();
	const galleryName = presentationServiceGalleryName();
	const token = presentationServiceTrackingToken();
	if (!accountId || !galleryName || !token) return EMPTY_PAGE;

	const result = await requestPresentationService(
		`/api/v1/accounts/${encodeURIComponent(accountId)}/galleries/by-name/${encodeURIComponent(galleryName)}?sort=recent&page=${page}`,
		{ operation: 'gallery.list', timeoutMs: GALLERY_READ_TIMEOUT_MS, bearerToken: token }
	);
	if (!result.ok || !result.response.ok) return EMPTY_PAGE;

	const payload = await readPresentationServiceJson(result.response);
	const galleryPage = parseGalleryPage(payload);
	if (!galleryPage) {
		console.error('Presentation-service gallery response had an unexpected shape', {
			operation: 'gallery.list'
		});
		return EMPTY_PAGE;
	}
	return galleryPage;
}

/** The track endpoint has no by-name variant — it only ever accepts knurl's real gallery
 * id — so a track call must resolve the configured name to an id first. Returns null (never
 * throws) on any misconfiguration, unreachable service, or malformed response. */
async function resolveGalleryId(
	accountId: string,
	galleryName: string,
	token: string
): Promise<string | null> {
	const result = await requestPresentationService(
		`/api/v1/accounts/${encodeURIComponent(accountId)}/galleries/by-name/${encodeURIComponent(galleryName)}?limit=1`,
		{ operation: 'gallery.resolve', timeoutMs: GALLERY_READ_TIMEOUT_MS, bearerToken: token }
	);
	if (!result.ok || !result.response.ok) return null;

	const payload = await readPresentationServiceJson(result.response);
	if (!isRecord(payload) || !isRecord(payload.gallery)) return null;
	return stringAt(payload.gallery, 'id');
}

let cachedGalleryId: { key: string; id: string; expiresAt: number } | null = null;
let pendingGalleryId: { key: string; promise: Promise<string | null> } | null = null;

function galleryIdForTracking(
	accountId: string,
	galleryName: string,
	token: string
): Promise<string | null> {
	const key = JSON.stringify([accountId, galleryName, token]);
	if (cachedGalleryId?.key === key && cachedGalleryId.expiresAt > Date.now()) {
		return Promise.resolve(cachedGalleryId.id);
	}
	if (pendingGalleryId?.key === key) return pendingGalleryId.promise;

	const promise = resolveGalleryId(accountId, galleryName, token)
		.then((id) => {
			if (id) cachedGalleryId = { key, id, expiresAt: Date.now() + GALLERY_ID_CACHE_MS };
			return id;
		})
		.finally(() => {
			if (pendingGalleryId?.key === key) pendingGalleryId = null;
		});
	pendingGalleryId = { key, promise };
	return promise;
}

/** Fire-and-forget analytics. Skips silently (logging once) when the gallery bearer,
 * account id, or gallery name isn't configured, or when the name can't be resolved to a
 * real gallery id, and never lets a failure reach the caller. */
export async function trackGalleryEvent(id: string, event: GalleryTrackingEvent): Promise<void> {
	const accountId = presentationServiceAccountId();
	const galleryName = presentationServiceGalleryName();
	const token = presentationServiceTrackingToken();
	if (!accountId || !galleryName || !token) {
		console.warn(
			'Skipping gallery tracking event: presentation-service tracking is not configured',
			{
				event
			}
		);
		return;
	}

	const galleryId = await galleryIdForTracking(accountId, galleryName, token);
	if (!galleryId) {
		console.warn(
			'Skipping gallery tracking event: could not resolve the configured gallery name to an id',
			{
				event
			}
		);
		return;
	}

	const result = await requestPresentationService(
		`/api/v1/accounts/${encodeURIComponent(accountId)}/galleries/${encodeURIComponent(galleryId)}/track`,
		{
			operation: 'gallery.track',
			method: 'POST',
			body: { id, event },
			timeoutMs: GALLERY_TRACK_TIMEOUT_MS,
			bearerToken: token
		}
	);
	if (result.ok && result.response.status === 404 && cachedGalleryId?.id === galleryId) {
		cachedGalleryId = null;
	}
}
