<script lang="ts">
  let {
    label,
    value,
    supplement,
    scale = 'card'
  }: {
    label: string;
    value: string;
    supplement: string;
    scale?: 'card' | 'sheet';
  } = $props();

  const figure = $derived(scale === 'sheet' ? 'text-[32px] font-normal' : 'text-xl font-medium');
</script>

<div>
  <p class="text-xs font-normal text-faint">{label}</p>
  <p data-figure class="mt-2 block leading-none text-ink tabular-nums {figure}">{value}</p>
  <p class="mt-2 text-xs font-normal text-faint tabular-nums">{supplement}</p>
</div>
