<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import { includedItemsForServingStyle } from '$lib/offering/included-items.js';
	import type { IncludedItem } from '$lib/offering/types.js';

	type Props = { items: IncludedItem[]; servingStyleId: string | undefined };
	let { items, servingStyleId }: Props = $props();
	let visibleItems = $derived(includedItemsForServingStyle(items, servingStyleId));
</script>

{#if visibleItems.length > 0}
	<div class="flex flex-col gap-3 rounded-(--radius-md) bg-(--brand-primary-tint) p-4">
		<span
			class="inline-flex items-center gap-1.5 font-sans text-(length:--text-caption) font-semibold tracking-(--track-wide) text-(--brand-primary) uppercase"
		>
			<CheckIcon class="size-3.5" aria-hidden="true" />
			Included with service
		</span>
		{#each visibleItems as item (item.id)}
			<div class="flex flex-col gap-1.5 text-(length:--text-body-sm) text-(--text-primary)">
				<h3 class="m-0 font-sans text-(length:--text-body-md) font-semibold">{item.label}</h3>
				{#if item.description}<p class="m-0">{item.description}</p>{/if}
				{#if item.contents?.length}
					<ul class="m-0 flex flex-col gap-1 pl-5">
						{#each item.contents as content (content.label)}<li>{content.label}</li>{/each}
					</ul>
				{/if}
			</div>
		{/each}
		<p class="m-0 text-(length:--text-caption) text-(--text-secondary)">
			Want to change anything included here? Tell us in “Anything else?” below.
		</p>
	</div>
{/if}
