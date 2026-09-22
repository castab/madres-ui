<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { eyebrow, headingDisplay } from '$lib/styles.js';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import TextField from '$lib/components/inquire/text-field.svelte';
	import CategorySection from '$lib/components/inquire/category-section.svelte';
	import GuestCountNote from '$lib/components/inquire/guest-count-note.svelte';
	import EstimateSummary from '$lib/components/inquire/estimate-summary.svelte';
	import IncludedItemsNote from '$lib/components/inquire/included-items-note.svelte';
	import StaffQuotedNote from '$lib/components/inquire/staff-quoted-note.svelte';
	import { InquireFormState } from './inquire-form-state.svelte.js';
	import { formatCentsRange } from '$lib/offering/money.js';
	import type { GuestFacts, Option } from '$lib/offering/types.js';
	import type { PageProps } from './$types.js';

	let { data, form }: PageProps = $props();

	const offering = $derived(data.offering);
	const formState = $derived(offering ? new InquireFormState(offering) : null);

	let submitting = $state(false);

	const selectedGuestOption = $derived.by<Option<GuestFacts> | undefined>(() => {
		if (!offering || !formState) return undefined;
		return offering.categories.guestCount.options.find((option) =>
			formState.isSelected('guestCount', option.id)
		);
	});

	async function handleSubmit({ cancel }: { cancel: () => void }) {
		if (!formState) {
			cancel();
			return;
		}
		formState.touched = true;
		if (!formState.isValid) {
			cancel();
			// Wait for the touched-state error messages to render, then bring the first one
			// into view — on mobile the invalid field is often off-screen below the button.
			await tick();
			const firstInvalid = document.querySelector<HTMLElement>(
				'#inquire-form [aria-invalid="true"], #inquire-form [data-invalid="true"]'
			);
			firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			firstInvalid?.focus?.();
			return;
		}
		submitting = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			submitting = false;
		};
	}
</script>

<svelte:head>
	<title>Inquire About Your Event | Madres Taco Shop</title>
</svelte:head>

<main>
	<section
		class="mx-auto flex max-w-(--container-narrow) flex-col items-center gap-(--stack-gap-tight) px-(--gutter) py-(--section-y) text-center"
	>
		<span class={eyebrow}>Private Event Catering</span>
		<h1 class={cn(headingDisplay, 'text-balance')}>Inquire About Your Event</h1>
		<p
			class="m-0 max-w-(--measure) text-(length:--text-body-lg) leading-(--leading-relaxed) text-(--text-secondary)"
		>
			Tell us about your event and we'll follow up with a proper quote. A completed contract &
			deposit secures your date.
		</p>
	</section>

	{#if !offering || !formState}
		<section
			class="mx-auto flex max-w-(--measure) flex-col items-center gap-3 px-(--gutter) py-(--section-y) text-center"
		>
			<h2 class="m-0 font-sans text-(length:--text-heading-lg) font-semibold text-(--text-primary)">
				Inquiries Aren't Open Yet
			</h2>
			<p
				class="m-0 text-(length:--text-body-lg) leading-(--leading-relaxed) text-(--text-secondary)"
			>
				We're putting the finishing touches on our inquiry form. Check back shortly, or follow along
				on Instagram in the meantime.
			</p>
		</section>
	{:else if form?.success}
		<section
			class="mx-auto flex max-w-(--measure) flex-col items-center gap-3 px-(--gutter) py-(--section-y) text-center"
		>
			<span class="text-(length:--text-heading-lg) text-(--color-sol-yellow-700)">✓</span>
			<p class="m-0 text-(length:--text-body-lg) leading-(--leading-relaxed) text-(--text-primary)">
				Thank you — your inquiry has been sent. We'll follow up by email with a full quote and next
				steps.
			</p>
			{#if form.estimate}
				<p class="m-0 text-(length:--text-body-md) text-(--text-secondary)">
					Your estimated total: {formatCentsRange(
						form.estimate.totalCentsLow,
						form.estimate.totalCentsHigh,
						offering.currency
					)}
				</p>
			{/if}
		</section>
	{:else}
		<section class="mx-auto max-w-(--container-narrow) px-(--gutter) pb-(--section-y)">
			<form
				id="inquire-form"
				method="POST"
				novalidate
				class="flex flex-col gap-(--stack-gap)"
				use:enhance={handleSubmit}
			>
				<div class="flex flex-col gap-4">
					<div class="flex items-center gap-3">
						<h2
							class="m-0 font-sans text-(length:--text-body-sm) font-semibold tracking-(--track-wider) text-(--brand-primary) uppercase"
						>
							Your Info
						</h2>
						<span class="h-px flex-1 bg-(--border-subtle)"></span>
					</div>
					<TextField
						id="name"
						name="name"
						label="Name"
						required
						bind:value={formState.name}
						error={form?.fieldErrors?.name?.[0] ?? formState.nameError}
					/>
					<TextField
						id="email"
						name="email"
						type="email"
						label="Email Address"
						required
						bind:value={formState.email}
						error={form?.fieldErrors?.email?.[0] ?? formState.emailError}
					/>
					<TextField
						id="zip"
						name="zip"
						label="ZIP Code"
						required
						bind:value={formState.zip}
						error={form?.fieldErrors?.zip?.[0] ?? formState.zipError}
						helperText="Events outside our normal service area may incur an additional travel charge."
					/>
				</div>

				<div class="flex items-center gap-3">
					<h2
						class="m-0 font-sans text-(length:--text-body-sm) font-semibold tracking-(--track-wider) text-(--brand-primary) uppercase"
					>
						Your Event
					</h2>
					<span class="h-px flex-1 bg-(--border-subtle)"></span>
				</div>

				{#each Object.entries(offering.categories) as [categoryKey, category] (categoryKey)}
					<CategorySection
						{category}
						{categoryKey}
						currency={offering.currency}
						isSelected={(optionId) => formState.isSelected(categoryKey, optionId)}
						selectedOption={formState.selectedOption(categoryKey)}
						selectionCount={formState.selectionCount(categoryKey)}
						error={formState.categoryError(categoryKey)}
						onSelectSingle={(optionId) => formState.selectSingle(categoryKey, optionId)}
						onToggleMulti={(optionId) =>
							formState.toggleMulti(categoryKey, optionId, category.maxSelections)}
					/>
					{#if categoryKey === 'guestCount'}
						<GuestCountNote option={selectedGuestOption} />
					{/if}
				{/each}

				<IncludedItemsNote items={offering.includedItems} />
				<StaffQuotedNote items={offering.staffQuotedExtras} />

				<EstimateSummary
					estimate={formState.estimate}
					currency={offering.currency}
					isComplete={formState.selectionsComplete}
				/>

				{#if form?.selectionIssues?.length}
					<p class="m-0 text-(length:--text-body-sm) text-(--state-danger)">
						{form.selectionIssues.join(' ')}
					</p>
				{/if}
				{#if form?.formError}
					<p class="m-0 text-(length:--text-body-sm) text-(--state-danger)">{form.formError}</p>
				{/if}
				{#if formState.touched && !formState.isValid}
					<p class="m-0 text-(length:--text-body-sm) text-(--state-danger)" role="alert">
						Please complete the highlighted fields above before sending your inquiry.
					</p>
				{/if}

				<Button type="submit" variant="cta" size="lg" disabled={submitting}>
					{submitting ? 'Sending…' : 'Send Inquiry'}
				</Button>
			</form>
		</section>
	{/if}
</main>
