<script lang="ts">
	import { resolve } from '$app/paths';

	let { variant = 'brown' }: { variant?: 'brown' | 'white' } = $props();
</script>

{#if variant === 'brown'}
	<a
		href={resolve('/')}
		aria-label="Madres Taco Shop home"
		class="flex min-w-0 shrink items-center"
	>
		<img
			src="/images/logo-text-brown.png"
			alt="Madres Taco Shop"
			width="2401"
			height="822"
			class="h-9 w-auto object-contain object-left sm:h-11"
		/>
	</a>
{:else}
	<img
		src="/images/logo-text-white.png"
		alt="Madres Taco Shop"
		width="2401"
		height="835"
		class="h-9 w-auto object-contain sm:h-11"
	/>
{/if}
