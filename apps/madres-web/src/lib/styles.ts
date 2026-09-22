import { cn } from '$lib/utils.js';

export const focusRing =
	'focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)';

export const buttonBase = cn(
	'inline-flex items-center justify-center whitespace-nowrap rounded-full font-sans font-semibold',
	'transition-[background-color,color,box-shadow,transform] duration-[120ms] ease-[var(--ease-out)]',
	'disabled:cursor-not-allowed disabled:opacity-45',
	focusRing
);

/** The Jost display scale: 600-weight sits loose at size. */
export const headingDisplay =
	'm-0 font-sans text-(length:--text-display-xl) font-semibold leading-(--leading-tight) text-(--text-primary)';

export const headingSection =
	'm-0 font-sans text-(length:--text-heading-lg) font-semibold leading-(--leading-snug) text-(--text-primary)';

export const eyebrow =
	'font-sans text-(length:--text-overline) font-medium uppercase tracking-(--track-wider) text-(--brand-primary)';
