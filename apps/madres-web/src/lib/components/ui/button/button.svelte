<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	export const buttonVariants = tv({
		base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans font-semibold transition-[background-color,color,box-shadow,transform] duration-(--dur-fast) ease-(--ease-out) focus-visible:outline-solid focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-45',
		variants: {
			variant: {
				primary: 'bg-(--brand-primary) text-(--text-on-accent) hover:bg-(--brand-primary-hover)',
				cta: 'bg-(--brand-cta) text-(--text-on-accent) hover:bg-(--brand-cta-hover)',
				secondary:
					'border-2 border-(--brand-primary) bg-transparent text-(--brand-primary) hover:bg-(--brand-primary-tint)',
				ghost: 'bg-transparent text-(--text-primary) hover:bg-(--surface-sunken)'
			},
			size: {
				sm: 'min-h-9 px-4 text-sm',
				md: 'min-h-11 px-[22px] text-base',
				lg: 'min-h-12 px-[30px] text-lg'
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'primary',
		size = 'md',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- generic primitive; callers resolve() their own href -->
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
