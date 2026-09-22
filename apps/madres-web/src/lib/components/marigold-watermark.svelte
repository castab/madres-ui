<script lang="ts">
	let layer: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!layer) return;
		const prefersReducedMotion =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) return;

		let raf = 0;
		const tick = () => {
			if (!layer) return;
			const y = Math.max(0, -document.body.getBoundingClientRect().top);
			const t = performance.now();
			const backgroundSize = parseFloat(getComputedStyle(layer).backgroundSize) || 200;
			const tileHeight = backgroundSize * (1186 / 1208);
			const x = Math.sin(t / 3700) * 16 + Math.cos(t / 6100) * 8;
			const yOffset = -((y * 0.45) % tileHeight) + Math.sin(t / 4200) * 18;
			layer.style.transform = `translate3d(${x}px, ${yOffset}px, 0)`;
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});
</script>

<div aria-hidden="true" class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
	<div
		bind:this={layer}
		class="absolute -inset-x-[10%] -top-[140%] -bottom-[140%] bg-repeat opacity-[0.075] will-change-transform lg:opacity-[0.065]"
		style="background-image: url('/images/marigold-tile.png'); background-size: clamp(150px, 40vw, 440px) auto; background-position: -6% 0;"
	></div>
</div>
