<script lang="ts">
	import { eyebrow, headingDisplay } from '$lib/styles.js';
	import { cn } from '$lib/utils.js';
</script>

<svelte:head>
	<title>Inquiry Sent | Madres Taco Shop</title>
</svelte:head>

<main>
	<section
		class="mx-auto flex max-w-(--container-narrow) flex-col items-center gap-(--stack-gap-tight) px-(--gutter) py-(--section-y) text-center"
	>
		<span class={eyebrow}>Private Event Catering</span>
		<h1 class={cn(headingDisplay, 'text-balance')}>Inquiry Sent</h1>
		<p
			class="m-0 max-w-(--measure) text-(length:--text-body-lg) leading-(--leading-relaxed) text-(--text-secondary)"
		>
			Thanks — your inquiry has been sent to our team. We'll follow up by email with a full quote
			and next steps soon.
		</p>
	</section>
</main>
