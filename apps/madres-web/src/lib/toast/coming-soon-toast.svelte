<script lang="ts">
	import { fly } from 'svelte/transition';
	import InfoIcon from '@lucide/svelte/icons/info';
	import XIcon from '@lucide/svelte/icons/x';
	import { buttonBase, focusRing } from '$lib/styles.js';
	import { cn } from '$lib/utils.js';
	import {
		comingSoonToastState,
		dismissComingSoonToast,
		pauseComingSoonToast,
		resumeComingSoonToast
	} from './coming-soon-toast-state.svelte.js';

	const toastState = comingSoonToastState();
</script>

<div
	class="pointer-events-none fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 outline-none sm:max-w-xl"
	aria-live="polite"
	aria-atomic="false"
	role="region"
	aria-label="Notifications"
>
	{#if toastState.visible}
		<div
			role="dialog"
			aria-modal="false"
			aria-labelledby="coming-soon-toast-title"
			aria-describedby="coming-soon-toast-description"
			tabindex="-1"
			onmouseenter={pauseComingSoonToast}
			onmouseleave={resumeComingSoonToast}
			onfocusin={pauseComingSoonToast}
			onfocusout={resumeComingSoonToast}
			class={cn(
				'group/toast pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--surface-card-raised) text-(--text-primary) shadow-(--shadow-lg) outline-none select-none',
				focusRing
			)}
			transition:fly={{ y: 40, duration: 220 }}
		>
			<div
				class="grid h-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 p-4 sm:flex sm:gap-3"
			>
				<span class="shrink-0">
					<InfoIcon aria-hidden="true" class="size-4 text-(--brand-primary)" />
				</span>
				<div class="flex min-w-0 flex-1 flex-col gap-1">
					<p
						id="coming-soon-toast-title"
						class="m-0 font-sans text-sm font-semibold text-(--text-primary)"
					>
						{toastState.title}
					</p>
					<p
						id="coming-soon-toast-description"
						class="m-0 font-sans text-sm text-(--text-secondary)"
					>
						{toastState.description}
					</p>
					<button
						type="button"
						onclick={toastState.onAction}
						class={cn(
							buttonBase,
							'mt-2 min-h-9 w-full max-w-full shrink-0 border-2 border-(--brand-primary) bg-transparent px-3 text-xs text-(--brand-primary) hover:bg-(--brand-primary-tint) sm:w-fit'
						)}
					>
						{toastState.actionLabel}
					</button>
				</div>
				<button
					type="button"
					onclick={dismissComingSoonToast}
					aria-label="Close toast"
					class={cn(
						'relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-(--text-secondary) transition-colors duration-(--dur-fast) ease-(--ease-out) hover:text-(--text-primary)',
						focusRing
					)}
				>
					<XIcon aria-hidden="true" class="size-4" />
				</button>
			</div>
			{#key toastState.updateKey}
				<span
					data-slot="toast-timer"
					aria-hidden="true"
					class="absolute inset-x-0 bottom-0 h-[3px] origin-left rounded-b-2xl bg-(--brand-primary)/35 group-focus-within/toast:[animation-play-state:paused] group-hover/toast:[animation-play-state:paused]"
					style="animation-name: toast-timer-shrink; animation-duration: {toastState.timeoutMs}ms; animation-timing-function: linear; animation-fill-mode: forwards;"
				></span>
			{/key}
		</div>
	{/if}
</div>
