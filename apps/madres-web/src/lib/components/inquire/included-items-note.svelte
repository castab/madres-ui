<script lang="ts">
	import type { IncludedItem } from '$lib/offering/types.js';

	type Props = { items: IncludedItem[] };
	let { items }: Props = $props();
</script>

{#if items.length > 0}
	<div class="flex flex-col gap-2 rounded-(--radius-md) bg-(--surface-sunken) p-4">
		<span
			class="font-sans text-(length:--text-caption) font-semibold tracking-(--track-wide) text-(--text-secondary) uppercase"
		>
			Included with service
		</span>
		<ul class="m-0 flex flex-col gap-1 pl-5 text-(length:--text-body-sm) text-(--text-primary)">
			{#each items as item (item.id)}
				<li>{item.label}</li>
			{/each}
		</ul>
	</div>
{/if}
