<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import BrandMark from './brand-mark.svelte';
	import ComingSoonButton from './coming-soon-button.svelte';
	import { cn } from '$lib/utils.js';

	const baseNavigation = [
		{ href: '/#experience', label: 'Experience' },
		{ href: '/#menu', label: 'Menu' },
		{ href: '/gallery', label: 'Gallery' }
	] as const;

	const navigation = $derived(
		page.data.offeringAvailable
			? [...baseNavigation, { href: '/inquire', label: 'Inquire' } as const]
			: baseNavigation
	);

	let isOpen = $state(false);
	const closeMenu = () => (isOpen = false);
</script>

<header
	class="sticky top-0 z-20 border-b border-(--border-subtle) bg-(--surface-page)/95 backdrop-blur"
>
	<div
		class="mx-auto flex max-w-(--container-max) items-center justify-between gap-4 px-(--gutter) py-3"
	>
		<BrandMark variant="brown" />
		<nav class="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
			{#each navigation as item (item.href)}
				<a
					href={resolve(item.href)}
					aria-current={page.url.pathname === item.href ? 'page' : undefined}
					class="rounded-md px-3 py-2 font-sans text-sm font-medium text-(--text-secondary) transition-colors duration-(--dur-fast) hover:bg-(--surface-sunken) hover:text-(--text-primary) aria-[current=page]:font-semibold aria-[current=page]:text-(--text-primary)"
				>
					{item.label}
				</a>
			{/each}
			<ComingSoonButton
				class="rounded-md px-3 py-2 font-sans text-sm font-semibold text-(--brand-primary)"
			>
				Book
			</ComingSoonButton>
		</nav>
		<button
			type="button"
			aria-expanded={isOpen}
			aria-controls="mobile-navigation"
			onclick={() => (isOpen = !isOpen)}
			class="grid size-11 place-items-center rounded-full text-(--text-primary) hover:bg-(--surface-sunken) md:hidden"
		>
			<span class="sr-only">{isOpen ? 'Close navigation' : 'Open navigation'}</span>
			<span aria-hidden="true" class="relative block h-0.5 w-5 bg-current">
				<span
					class={cn(
						'absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-(--dur-fast)',
						isOpen ? 'top-0 rotate-45' : '-top-1.5'
					)}
				></span>
				<span
					class={cn(
						'absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-(--dur-fast)',
						isOpen ? 'top-0 -rotate-45' : 'top-1.5'
					)}
				></span>
			</span>
		</button>
	</div>
	{#if isOpen}
		<nav
			id="mobile-navigation"
			aria-label="Mobile navigation"
			class="flex flex-col gap-1 border-t border-(--border-subtle) px-(--gutter) py-2 md:hidden"
		>
			{#each navigation as item (item.href)}
				<a
					href={resolve(item.href)}
					onclick={closeMenu}
					aria-current={page.url.pathname === item.href ? 'page' : undefined}
					class="min-h-(--tap-min) rounded-md px-2 py-3 font-sans text-sm font-medium text-(--text-secondary) aria-[current=page]:font-semibold aria-[current=page]:text-(--text-primary)"
				>
					{item.label}
				</a>
			{/each}
			<ComingSoonButton
				class="min-h-(--tap-min) rounded-md px-2 py-3 text-left font-sans text-sm font-semibold text-(--brand-primary)"
			>
				Book
			</ComingSoonButton>
		</nav>
	{/if}
</header>
