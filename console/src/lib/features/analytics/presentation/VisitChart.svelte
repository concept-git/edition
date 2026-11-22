<script lang="ts">
  import { Axis, Bars, Chart, Spline, Svg } from 'layerchart';
  import type { PlottedBucket } from '../domain/analytics';
  import VisitBars from './VisitBars.svelte';

  let { points }: { points: PlottedBucket[] } = $props();
  const yMax = $derived(Math.max(1, ...points.flatMap((point) => (typeof point.pv === 'number' ? [point.pv] : []))));

  function drawn(point: PlottedBucket) {
    return point.pv !== null;
  }
</script>

<figure aria-label="访问趋势">
  <div class="h-56">
    <Chart data={points} x="label" y="pv" yDomain={[0, yMax]} padding={{ top: 12, right: 8, bottom: 28, left: 36 }} class="h-full w-full">
      <Svg>
        <Axis placement="left" />
        <Axis placement="bottom" />
        <Spline defined={drawn} motion="none" class="fill-none stroke-accent" />
        <Bars>
          <VisitBars {points} />
        </Bars>
      </Svg>
    </Chart>
  </div>
  <ul aria-label="时间桶" class="mt-3 flex flex-col gap-1 text-sm text-ink">
    {#each points as point (point.time)}
      <li>{point.label} {point.pv === null ? '—' : point.pv}</li>
    {/each}
  </ul>
</figure>
