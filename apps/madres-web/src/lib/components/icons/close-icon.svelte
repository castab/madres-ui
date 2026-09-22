<script lang="ts">
	let { size = 18 }: { size?: number } = $props();
</script>

<svg
	aria-hidden="true"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2.2"
	stroke-linecap="round"
>
	<path d="M6 6l12 12M18 6L6 18" />
</svg>
