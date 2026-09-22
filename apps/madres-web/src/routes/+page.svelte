<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Card } from '$lib/components/ui/card/index.js';
	import { Tag } from '$lib/components/ui/tag/index.js';
	import InquireCta from '$lib/components/inquire-cta.svelte';
	import MarigoldWatermark from '$lib/components/marigold-watermark.svelte';
	import { eyebrow, headingDisplay, headingSection } from '$lib/styles.js';
	import { cn } from '$lib/utils.js';

	const experience = [
		{
			eyebrow: 'Service Style',
			title: 'Classic Window Service',
			subtitle:
				'The truck pulls up, the window opens, and our crew hands tacos out hot, one order at a time — the way Madres started.'
		},
		{
			eyebrow: 'Service Style',
			title: 'Build-Your-Own Buffet',
			subtitle:
				'Proteins, salsas and garnishes laid out on brass serving ware so guests top their own, family-style. Our most requested setup.'
		},
		{
			eyebrow: 'Included',
			title: 'A Styled Table',
			subtitle:
				'Scalloped brass bowls, white linens, dried florals and warm low lighting — the table is set to match the room, not the truck.'
		}
	];

	const featuredTacos = [
		{
			name: 'Carne Asada',
			desc: 'Marinated steak, seared on the plancha, salsa verde, lime — the one everyone asks for.'
		},
		{
			name: 'Adobada',
			desc: 'Marinated pork, seared on the plancha, cilantro, white onion.'
		},
		{
			name: 'Chorizo',
			desc: 'House chorizo, crisped on the plancha, white onion, cilantro.'
		}
	];

	const sideTags = ['Elote en Vaso', 'Chips & Salsa Roja', 'Horchata', 'Infused Water'];

	const steps = [
		{
			number: '01',
			title: 'Send your details',
			copy: 'Event date, guest count and location — the form below is all we need to start.'
		},
		{
			number: '02',
			title: 'Build the menu',
			copy: 'We propose a service style, taco lineup and sides scaled to your headcount.'
		},
		{
			number: '03',
			title: 'Contract & deposit',
			copy: 'A completed contract and deposit is required to secure your booking.'
		},
		{
			number: '04',
			title: 'We arrive and set up',
			copy: 'Truck, table and crew arrive ahead of service. You host; we handle the rest.'
		}
	];
</script>

<MarigoldWatermark />
<main id="top" class="relative z-10">
	<section class="relative bg-(--surface-page)">
		<div
			class="mx-auto grid max-w-(--container-max) grid-cols-1 items-center gap-(--stack-gap) px-(--gutter) py-(--section-y) lg:grid-cols-2 lg:gap-14"
		>
			<div class="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
				<span class={eyebrow}>Private Event Catering</span>
				<h1 class={headingDisplay}>Fine dining,<br />catered to you.</h1>
				<p
					class="m-0 max-w-(--measure) text-(length:--text-body-lg) leading-(--leading-relaxed) text-(--text-secondary)"
				>
					Tortillas from our local tortillería, proteins seared on the plancha, and a marinade that
					hasn't changed since day one — brought to your private event by reservation only.
				</p>
				<div
					class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start"
				>
					<InquireCta
						class={cn(
							'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-(--brand-cta) px-6 font-sans font-semibold text-(--text-on-accent)'
						)}
					>
						Inquire
					</InquireCta>
					<a
						href="#menu"
						class="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-(--brand-primary) px-6 font-sans font-semibold text-(--brand-primary) transition-colors hover:bg-(--brand-primary-tint)"
					>
						View Sample Menu
					</a>
				</div>
			</div>
			<div
				class="relative aspect-(--ratio-hero) w-full overflow-hidden rounded-2xl bg-(--surface-sunken) shadow-(--shadow-lg) lg:aspect-[4/5]"
			>
				<img
					src="/images/photo-buffet-spread.png"
					alt="Madres buffet spread on brass serving ware"
					class="absolute inset-0 h-full w-full object-cover"
				/>
			</div>
		</div>
	</section>

	<section class="bg-(--brand-primary) text-(--text-on-accent)">
		<div
			class="mx-auto flex max-w-(--container-max) flex-col items-start gap-4 px-(--gutter) py-8 md:flex-row md:items-center md:justify-between"
		>
			<div class="flex flex-col items-start gap-3 md:flex-row md:items-center">
				<Badge tone="accent">Trending</Badge>
				<span class="text-(length:--text-body-lg) leading-(--leading-snug)">
					Build-your-own taco buffet — guests top their own, family-style.
				</span>
			</div>
			<InquireCta
				class="inline-flex min-h-11 items-center justify-center rounded-full bg-(--brand-cta) px-6 font-sans font-semibold text-(--text-on-accent)"
			>
				Check Availability
			</InquireCta>
		</div>
	</section>

	<section
		id="experience"
		class="mx-auto flex max-w-(--container-max) flex-col gap-(--stack-gap) px-(--gutter) py-(--section-y)"
	>
		<div class="flex flex-col gap-2">
			<span class={eyebrow}>The Experience</span>
			<h2 class={headingSection}>Two ways we serve your night</h2>
		</div>
		<div
			class="grid grid-cols-1 gap-(--stack-gap) sm:grid-cols-[repeat(auto-fit,minmax(var(--card-min),1fr))]"
		>
			{#each experience as item (item.title)}
				<Card eyebrow={item.eyebrow} title={item.title} subtitle={item.subtitle} />
			{/each}
		</div>
	</section>

	<section class="bg-(--surface-sunken)">
		<div
			id="menu"
			class="mx-auto flex max-w-(--container-max) flex-col gap-(--stack-gap) px-(--gutter) py-(--section-y)"
		>
			<div class="flex flex-col gap-2">
				<span class={eyebrow}>Sample Menu</span>
				<h2 class={headingSection}>Fan favorites</h2>
				<p
					class="m-0 max-w-(--measure) text-(length:--text-body-lg) leading-(--leading-relaxed) text-(--text-secondary)"
				>
					Carne asada leads every menu we build. Full menus are shaped around your guest count and
					event.
				</p>
			</div>
			<div
				class="grid grid-cols-1 gap-(--stack-gap) sm:grid-cols-[repeat(auto-fit,minmax(var(--card-min),1fr))]"
			>
				{#each featuredTacos as item (item.name)}
					<Card eyebrow="Tacos" title={item.name} subtitle={item.desc} />
				{/each}
			</div>
			<p class="m-0 max-w-(--measure) text-sm leading-(--leading-relaxed) text-(--text-secondary)">
				Our veggie taco is cooked on the same plancha as our meats — we can prepare it vegan on
				request, but we can't guarantee a griddle free of all animal product. No seafood is served.
			</p>
			<div class="flex flex-wrap gap-2">
				{#each sideTags as label (label)}
					<Tag>{label}</Tag>
				{/each}
			</div>
		</div>
	</section>

	<section
		class="mx-auto flex max-w-(--measure) flex-col items-center gap-(--stack-gap-tight) px-(--gutter) py-(--section-y) text-center"
	>
		<img src="/images/marigold-single.png" alt="" class="h-24 w-auto opacity-90" />
		<p
			class="m-0 font-serif text-(length:--text-display-md) leading-(--leading-snug) font-semibold text-(--color-sol-yellow-700)"
		>
			Our guests are still talking about the beautiful tablescape and the delicious tacos.
		</p>
		<span
			class="text-(length:--text-overline) tracking-(--track-wider) text-(--text-secondary) uppercase"
		>
			Wedding reception · 140 guests
		</span>
	</section>

	<section
		id="how"
		class="mx-auto flex max-w-(--container-max) flex-col gap-(--stack-gap) px-(--gutter) py-(--section-y)"
	>
		<div class="flex flex-col gap-2">
			<span class={eyebrow}>How to Inquire</span>
			<h2 class={headingSection}>Four steps to a booked date</h2>
		</div>
		<div class="grid grid-cols-1 gap-(--stack-gap) md:grid-cols-2">
			{#each steps as step (step.number)}
				<div class="grid grid-cols-[auto_1fr] items-start gap-4">
					<span
						class="min-w-[1.6em] font-sans text-(length:--text-heading-lg) font-semibold text-(--color-sol-yellow-700)"
					>
						{step.number}
					</span>
					<div class="flex flex-col gap-1">
						<h3
							class="m-0 font-sans text-(length:--text-heading-md) font-semibold text-(--text-primary)"
						>
							{step.title}
						</h3>
						<p
							class="m-0 text-(length:--text-body-md) leading-(--leading-relaxed) text-(--text-secondary)"
						>
							{step.copy}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section class="bg-(--surface-sunken)">
		<div
			id="inquire"
			class="mx-auto flex max-w-(--container-narrow) flex-col items-center gap-(--stack-gap) px-(--gutter) py-(--section-y) text-center"
		>
			<h2
				class="m-0 font-serif text-(length:--text-display-md) font-semibold tracking-(--track-wide) text-balance text-(--color-sol-yellow-700) uppercase"
			>
				Inquire About Your Event
			</h2>
			<p
				class="m-0 max-w-(--measure) text-(length:--text-body-lg) leading-(--leading-relaxed) text-(--text-secondary)"
			>
				Madres appears by reservation only — private events and select pop-ups. Tell us about yours.
			</p>
			<InquireCta
				class="inline-flex min-h-12 items-center justify-center rounded-full bg-(--brand-cta) px-8 font-sans text-lg font-semibold text-(--text-on-accent)"
			>
				Inquire
			</InquireCta>
		</div>
	</section>
</main>
