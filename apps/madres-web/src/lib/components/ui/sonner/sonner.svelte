<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';

	let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
	theme="light"
	class="toaster group"
	style="--normal-bg: var(--surface-card-raised); --normal-text: var(--text-primary); --normal-border: var(--border-subtle);"
	{...restProps}
/>
