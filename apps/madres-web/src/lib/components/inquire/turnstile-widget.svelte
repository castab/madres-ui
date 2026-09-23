<script lang="ts">
	const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

	/** Cloudflare's script self-registers `window.turnstile` on load — this loader appends it at
	 * most once per page, no matter how many widgets mount, and every caller awaits the same
	 * promise. */
	let scriptLoadPromise: Promise<void> | null = null;
	function loadTurnstileScript(): Promise<void> {
		if (window.turnstile) return Promise.resolve();
		if (!scriptLoadPromise) {
			scriptLoadPromise = new Promise<void>((resolve, reject) => {
				const script = document.createElement('script');
				script.src = SCRIPT_URL;
				script.async = true;
				script.defer = true;
				script.onload = () => resolve();
				script.onerror = () => reject(new Error('Failed to load the Turnstile script'));
				document.head.appendChild(script);
			});
		}
		return scriptLoadPromise;
	}

	type Props = {
		siteKey: string;
		invalid?: boolean;
		token?: string;
	};

	let { siteKey, invalid, token = $bindable('') }: Props = $props();

	let container: HTMLElement | undefined = $state();
	let widgetId: string | undefined;

	$effect(() => {
		if (!container) return;
		let cancelled = false;

		loadTurnstileScript()
			.then(() => {
				if (cancelled || !container || !window.turnstile) return;
				widgetId = window.turnstile.render(container, {
					sitekey: siteKey,
					theme: 'auto',
					size: 'flexible',
					callback: (value) => {
						token = value;
					},
					'expired-callback': () => {
						token = '';
					},
					'error-callback': () => {
						token = '';
					}
				});
			})
			.catch((loadError: unknown) => {
				console.error('Turnstile failed to load', loadError);
			});

		return () => {
			cancelled = true;
			if (widgetId && window.turnstile) {
				window.turnstile.remove(widgetId);
				widgetId = undefined;
			}
		};
	});
</script>

<!-- Cloudflare's widget renders its own `cf-turnstile-response` hidden input inside this
     container once it mounts — that's what the form action reads; `token` here is only for
     the client-side `formState.isValid` gate. `aria-invalid` doesn't drive any visible text of
     its own — it lets the form's existing "scroll to the first invalid field" handler find this
     widget the same way it finds an invalid text field. `size: 'flexible'` (set on the render
     call below) makes the widget fill this div's width, matching the submit button above it. -->
<div
	bind:this={container}
	class="w-full"
	aria-invalid={invalid ? 'true' : undefined}
	data-turnstile-complete={token.length > 0}
></div>
