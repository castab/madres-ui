<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: 'inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-xs font-medium tracking-(--track-tight)',
		variants: {
			tone: {
				neutral: 'bg-(--surface-sunken) text-(--text-secondary)',
				accent: 'bg-(--brand-accent-tint) text-(--color-sol-yellow-700)'
			}
		},
		defaultVariants: {
			tone: 'neutral'
		}
	});

	export type BadgeTone = VariantProps<typeof badgeVariants>['tone'];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		tone = 'neutral',
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		tone?: BadgeTone;
	} = $props();
</script>

<span
	bind:this={ref}
	data-slot="badge"
	class={cn(badgeVariants({ tone }), className)}
	{...restProps}
>
	{@render children?.()}
</span>
