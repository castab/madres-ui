<script lang="ts">
	import type { StaffQuotedExtra } from '$lib/offering/types.js';

	type Props = { items: StaffQuotedExtra[] };
	let { items }: Props = $props();
</script>

{#if items.length > 0}
	<div class="flex flex-col gap-2 rounded-(--radius-md) border border-(--border-subtle) p-4">
		<p class="m-0 text-(length:--text-body-sm) leading-(--leading-relaxed) text-(--text-secondary)">
			Travel outside our normal service area and special requests may affect your final quote. These
			are confirmed by our staff and aren't part of the estimate above:
		</p>
		<ul class="m-0 flex flex-col gap-1 pl-5 text-(length:--text-body-sm) text-(--text-secondary)">
			{#each items as item (item.id)}
				<li>{item.label}</li>
			{/each}
		</ul>
	</div>
{/if}
