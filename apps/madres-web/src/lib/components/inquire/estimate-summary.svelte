<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { formatCents } from '$lib/offering/money.js';
	import type { Estimate, EstimateLineItem } from '$lib/offering/types.js';

	type Props = { estimate: Estimate; currency: string; isComplete: boolean };
	let { estimate, currency, isComplete }: Props = $props();

	const perEventItems = $derived(estimate.lineItems.filter((item) => item.kind === 'per-event'));
	const perGuestItems = $derived(estimate.lineItems.filter((item) => item.kind === 'per-guest'));
	const perItemItems = $derived(estimate.lineItems.filter((item) => item.kind === 'per-item'));

	function amountLabel(item: EstimateLineItem): string {
		return item.included ? 'Included' : formatCents(item.amountCents, currency);
	}
</script>

<div
	class="flex flex-col gap-4 rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface-card-raised) p-5 shadow-(--shadow-sm)"
>
	<div class="flex items-center justify-between gap-3">
		<span
			class="font-sans text-(length:--text-body-sm) font-semibold tracking-(--track-wider) text-(--text-primary) uppercase"
		>
			Estimated Event Cost
		</span>
		<Badge tone="neutral">Estimate Only</Badge>
	</div>

	{#if !isComplete}
		<p class="m-0 text-(length:--text-body-md) leading-(--leading-relaxed) text-(--text-secondary)">
			Complete your selections above to see your estimated event cost.
		</p>
	{:else}
		{#if perEventItems.length > 0}
			<div class="flex flex-col gap-1.5">
				{#each perEventItems as item (item.id)}
					<div class="flex items-baseline justify-between gap-3 text-(length:--text-body-md)">
						<span class="text-(--text-primary)">{item.label}</span>
						<span class="font-medium text-(--text-primary)">{amountLabel(item)}</span>
					</div>
				{/each}
			</div>
		{/if}

		{#if perGuestItems.length > 0}
			<div class="flex flex-col gap-1.5 border-t border-(--border-subtle) pt-3">
				<span
					class="text-(length:--text-caption) font-medium tracking-(--track-wide) text-(--text-secondary) uppercase"
					>Per guest</span
				>
				{#each perGuestItems as item (item.id)}
					<div class="flex items-baseline justify-between gap-3 text-(length:--text-body-md)">
						<span class="text-(--text-primary)">{item.label}</span>
						<span class="font-medium text-(--text-primary)">{amountLabel(item)}</span>
					</div>
				{/each}
			</div>
		{/if}

		<div class="flex flex-col gap-1.5 border-t border-(--border-strong) pt-3">
			<div
				class="flex items-baseline justify-between gap-3 text-(length:--text-body-sm) text-(--text-secondary)"
			>
				<span>Per guest</span>
				<span>{formatCents(estimate.perGuestCents, currency)}</span>
			</div>
			<div
				class="flex items-baseline justify-between gap-3 text-(length:--text-body-sm) text-(--text-secondary)"
			>
				<span>Estimated guests</span>
				<span>{estimate.guestCount}</span>
			</div>
			<div
				class="flex items-baseline justify-between gap-3 text-(length:--text-body-sm) text-(--text-secondary)"
			>
				<span>Guest subtotal</span>
				<span>{formatCents(estimate.perGuestTotalCents, currency)}</span>
			</div>
		</div>

		{#if perItemItems.length > 0}
			<div class="flex flex-col gap-1.5 border-t border-(--border-subtle) pt-3">
				<span
					class="text-(length:--text-caption) font-medium tracking-(--track-wide) text-(--text-secondary) uppercase"
					>Appetizers</span
				>
				{#each perItemItems as item (item.id)}
					<div class="flex items-baseline justify-between gap-3 text-(length:--text-body-md)">
						<span class="text-(--text-primary)"
							>{item.quantity} × {item.label} ({formatCents(item.unitCents ?? 0, currency)} each)</span
						>
						<span class="font-medium text-(--text-primary)"
							>{formatCents(item.amountCents, currency)}</span
						>
					</div>
				{/each}
				<div
					class="flex items-baseline justify-between gap-3 text-(length:--text-body-sm) text-(--text-secondary)"
				>
					<span>Appetizer subtotal</span>
					<span>{formatCents(estimate.itemTotalCents, currency)}</span>
				</div>
			</div>
		{/if}

		{#if estimate.minimumAdjustmentCents > 0}
			<div
				class="flex items-baseline justify-between gap-3 text-(length:--text-body-sm) text-(--text-secondary)"
			>
				<span
					>Serving style minimum adjustment (to {formatCents(
						estimate.minimumEventCents,
						currency
					)})</span
				>
				<span>{formatCents(estimate.minimumAdjustmentCents, currency)}</span>
			</div>
		{/if}

		<div class="flex items-baseline justify-between gap-3 border-t border-(--border-strong) pt-3">
			<span class="font-sans text-(length:--text-body-lg) font-semibold text-(--text-primary)"
				>Estimated total</span
			>
			<span class="font-sans text-(length:--text-heading-lg) font-semibold text-(--text-primary)">
				{formatCents(estimate.totalCents, currency)}
			</span>
		</div>

		<p class="m-0 text-(length:--text-caption) leading-(--leading-relaxed) text-(--text-muted)">
			This is a preliminary estimate. Final pricing is confirmed by Madres after reviewing your
			inquiry.
		</p>
	{/if}
</div>
