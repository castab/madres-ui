export type ComingSoonToastOptions = {
	title: string;
	description: string;
	actionLabel: string;
	onAction: () => void;
	timeoutMs: number;
};

type ComingSoonToastState = ComingSoonToastOptions & {
	visible: boolean;
	/** Bumped on every show() so the timer-bar animation restarts even when a toast that's
	 * already visible is re-triggered (repeat clicks update it in place, resetting the timer,
	 * rather than stacking a new one per click). */
	updateKey: number;
};

const state = $state<ComingSoonToastState>({
	visible: false,
	updateKey: 0,
	title: '',
	description: '',
	actionLabel: '',
	onAction: () => {},
	timeoutMs: 0
});

let dismissAt = 0;
let remainingMs = 0;
let dismissTimer: ReturnType<typeof setTimeout> | undefined;

function clearDismissTimer() {
	clearTimeout(dismissTimer);
	dismissTimer = undefined;
}

export function comingSoonToastState(): ComingSoonToastState {
	return state;
}

export function showComingSoonToast(options: ComingSoonToastOptions) {
	clearDismissTimer();
	state.visible = true;
	state.updateKey += 1;
	state.title = options.title;
	state.description = options.description;
	state.actionLabel = options.actionLabel;
	state.onAction = options.onAction;
	state.timeoutMs = options.timeoutMs;

	remainingMs = options.timeoutMs;
	dismissAt = Date.now() + remainingMs;
	dismissTimer = setTimeout(() => {
		state.visible = false;
	}, remainingMs);
}

export function dismissComingSoonToast() {
	clearDismissTimer();
	state.visible = false;
}

/** Hovering/focusing the toast pauses its auto-dismiss (mirrored by the timer bar's own
 * `animation-play-state: paused` in CSS), so a visitor reading the message doesn't have it
 * vanish mid-read. */
export function pauseComingSoonToast() {
	if (!state.visible || !dismissTimer) return;
	clearDismissTimer();
	remainingMs = Math.max(0, dismissAt - Date.now());
}

export function resumeComingSoonToast() {
	if (!state.visible || dismissTimer) return;
	dismissAt = Date.now() + remainingMs;
	dismissTimer = setTimeout(() => {
		state.visible = false;
	}, remainingMs);
}
