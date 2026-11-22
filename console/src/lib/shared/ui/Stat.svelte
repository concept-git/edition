<script lang="ts">
  let { label, value, supplement }: { label: string; value: string; supplement: string } = $props();
</script>

<div>
  <p class="text-[13px] text-muted">{label}</p>
  <strong class="mt-3 block text-[40px] leading-none font-semibold text-ink">{value}</strong>
  <p class="mt-3 text-xs text-muted">{supplement}</p>
</div>
