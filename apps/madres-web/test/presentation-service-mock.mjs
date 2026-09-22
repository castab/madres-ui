import { createServer } from 'node:http';

// A small, dependency-free double for knurl's presentation-service, used only by
// Playwright. Serves a fixed gallery page for any account id and acknowledges
// tracking posts without asserting on the bearer token — e2e specs exercise the
// real fetch path against this instead of mocking `fetch` in-process.
const port = Number(process.env.PRESENTATION_SERVICE_MOCK_PORT ?? 4030);

// Two pages, so e2e specs can exercise Load More without a large fixture. Page one also
// carries a CAROUSEL_ALBUM post so the carousel dot-navigation flow can be exercised over a
// real HTTP fetch, not just mocked `fetch` in Vitest.
const galleryPages = [
	[
		{
			id: 'e2e-post-1',
			mediaType: 'IMAGE',
			caption: 'Carne asada hitting the plancha at a Saturday wedding reception.',
			permalink: 'https://www.instagram.com/p/Cabc123XYZ/',
			timestamp: '2026-08-01T00:00:00Z',
			mediaItems: [
				{
					mediaType: 'IMAGE',
					smallUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-1/small.webp',
					largeUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-1/large.webp',
					largeWidth: 600,
					largeHeight: 800,
					videoUrl: null,
					videoWidth: null,
					videoHeight: null,
					mediaUrlExpiresAt: '2099-01-01T00:00:00Z'
				}
			],
			viewCount: 0,
			clickCount: 0
		},
		{
			id: 'e2e-post-carousel',
			mediaType: 'CAROUSEL_ALBUM',
			caption: 'A whole spread from the taco bar.',
			permalink: 'https://www.instagram.com/p/Cmno345PQR/',
			timestamp: '2026-08-01T12:00:00Z',
			mediaItems: [
				{
					mediaType: 'IMAGE',
					smallUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-carousel/0/small.webp',
					largeUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-carousel/0/large.webp',
					largeWidth: 600,
					largeHeight: 800,
					videoUrl: null,
					videoWidth: null,
					videoHeight: null,
					mediaUrlExpiresAt: '2099-01-01T00:00:00Z'
				},
				{
					mediaType: 'VIDEO',
					smallUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-carousel/1/small.webp',
					largeUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-carousel/1/large.webp',
					largeWidth: 600,
					largeHeight: 800,
					videoUrl: null,
					videoWidth: null,
					videoHeight: null,
					mediaUrlExpiresAt: '2099-01-01T00:00:00Z'
				},
				{
					mediaType: 'VIDEO',
					smallUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-carousel/2/small.webp',
					largeUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-carousel/2/large.webp',
					largeWidth: 600,
					largeHeight: 800,
					videoUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-carousel/2/original',
					videoWidth: 1080,
					videoHeight: 1920,
					mediaUrlExpiresAt: '2099-01-01T00:00:00Z'
				}
			],
			viewCount: 0,
			clickCount: 0
		}
	],
	[
		{
			id: 'e2e-post-2',
			mediaType: 'VIDEO',
			caption: 'Guests building their own tacos, buffet-style, at a backyard anniversary.',
			permalink: 'https://www.instagram.com/p/Cdef456UVW/',
			timestamp: '2026-08-02T00:00:00Z',
			mediaItems: [
				{
					mediaType: 'VIDEO',
					smallUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-2/small.webp',
					largeUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-2/large.webp',
					largeWidth: 600,
					largeHeight: 800,
					videoUrl: 'https://example-bucket.s3.amazonaws.com/e2e/post-2/original',
					videoWidth: 1080,
					videoHeight: 1920,
					mediaUrlExpiresAt: '2099-01-01T00:00:00Z'
				}
			],
			viewCount: 0,
			clickCount: 0
		}
	]
];

const galleryName = 'Madres Taco Shop';
const galleryId = 'e2e-gallery-uuid';

function paginationFor(page) {
	const totalPages = galleryPages.length;
	return {
		totalRecords: galleryPages.flat().length,
		currentPage: page,
		totalPages,
		links: {
			first: '/api/v1/accounts/e2e/galleries/by-name/Madres%20Taco%20Shop?page=1',
			prev:
				page > 1
					? `/api/v1/accounts/e2e/galleries/by-name/Madres%20Taco%20Shop?page=${page - 1}`
					: null,
			self: `/api/v1/accounts/e2e/galleries/by-name/Madres%20Taco%20Shop?page=${page}`,
			next:
				page < totalPages
					? `/api/v1/accounts/e2e/galleries/by-name/Madres%20Taco%20Shop?page=${page + 1}`
					: null,
			last: `/api/v1/accounts/e2e/galleries/by-name/Madres%20Taco%20Shop?page=${totalPages}`
		}
	};
}

function json(response, status, body) {
	response.writeHead(status, { 'content-type': 'application/json' });
	response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
	const url = new URL(request.url, `http://${request.headers.host}`);

	if (url.pathname === '/__test__/health') {
		json(response, 200, { status: 'ok' });
		return;
	}

	const byNameMatch = url.pathname.match(
		/^\/api\/v1\/accounts\/[^/]+\/galleries\/by-name\/([^/]+)$/
	);
	if (request.method === 'GET' && byNameMatch) {
		if (request.headers.authorization !== 'Bearer e2e-presentation-service-tracking-token') {
			json(response, 401, { error: 'unauthorized' });
			return;
		}
		if (decodeURIComponent(byNameMatch[1]) !== galleryName) {
			json(response, 404, { error: 'not_found' });
			return;
		}
		const page = Math.min(
			Math.max(Number(url.searchParams.get('page') ?? '1') || 1, 1),
			galleryPages.length
		);
		json(response, 200, {
			gallery: {
				id: galleryId,
				name: galleryName,
				itemCount: galleryPages.flat().length,
				publishedCount: galleryPages.flat().length,
				createdAt: '2026-08-01T00:00:00Z',
				updatedAt: '2026-08-02T00:00:00Z'
			},
			data: galleryPages[page - 1],
			pagination: paginationFor(page)
		});
		return;
	}

	const trackMatch = url.pathname.match(/^\/api\/v1\/accounts\/[^/]+\/galleries\/([^/]+)\/track$/);
	if (request.method === 'POST' && trackMatch) {
		if (request.headers.authorization !== 'Bearer e2e-presentation-service-tracking-token') {
			json(response, 401, { error: 'unauthorized' });
			return;
		}
		// Only the id resolved from the by-name lookup is a valid track target — a caller that
		// posted the gallery *name* here (skipping resolution) would get a 404, same as knurl
		// would for an id that doesn't exist.
		if (trackMatch[1] !== galleryId) {
			json(response, 404, { error: 'not_found' });
			return;
		}
		json(response, 200, { status: 'ok' });
		return;
	}

	json(response, 404, { error: 'not_found' });
});

server.listen(port, '127.0.0.1', () => {
	console.log(`presentation-service double listening on http://127.0.0.1:${port}`);
});
