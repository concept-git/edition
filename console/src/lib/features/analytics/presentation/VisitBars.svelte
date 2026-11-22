<script lang="ts">
  import { Bar } from 'layerchart';
  import type { PlottedBucket } from '../domain/analytics';

  let { points }: { points: PlottedBucket[] } = $props();
</script>

{#each points as point (point.time)}
  {#if point.pv !== null}
    <Bar data={point} data-pv={point.pv} class="fill-accent" stroke="none" strokeWidth={0} motion="none" />
  {/if}
{/each}
