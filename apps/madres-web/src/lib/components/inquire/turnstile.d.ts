type TurnstileRenderOptions = {
	sitekey: string;
	theme?: 'light' | 'dark' | 'auto';
	/** 'flexible' fills 100% of the container's width instead of Cloudflare's fixed 300px
	 * default — used so the widget can match the submit button's width. */
	size?: 'normal' | 'compact' | 'flexible';
	callback?: (token: string) => void;
	'expired-callback'?: () => void;
	'error-callback'?: () => void;
};

declare global {
	interface Window {
		turnstile?: {
			render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
			remove: (widgetId: string) => void;
		};
	}
}

export {};
