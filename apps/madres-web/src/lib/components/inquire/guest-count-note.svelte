<script lang="ts">
	import type { GuestFacts, Option } from '$lib/offering/types.js';

	type Props = { option: Option<GuestFacts> | undefined };
	let { option }: Props = $props();
</script>

{#if option?.facts?.isMinimum}
	<p class="m-0 text-(length:--text-caption) leading-(--leading-relaxed) text-(--text-secondary)">
		Estimate shown starting at {option.facts.minimumGuests} guests. Final pricing will depend on actual
		guest count.
	</p>
{/if}
