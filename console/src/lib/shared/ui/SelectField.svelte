<script lang="ts">
  let {
    label,
    value = $bindable(''),
    options,
    disabled = false,
    onchange,
    layout = 'stack',
    hint = ''
  }: {
    label: string;
    value?: string;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
    onchange?: (value: string) => void;
    layout?: 'stack' | 'line';
    hint?: string;
  } = $props();

  const id = $props.id();
  const control =
    'h-8 w-full rounded-nav border border-stroke bg-surface px-3 text-sm text-ink hover:border-faint disabled:pointer-events-none disabled:opacity-60';
</script>

{#if layout === 'line'}
  <div class="grid items-center gap-x-3 gap-y-1 border-b border-line py-4 sm:grid-cols-[7rem_14rem_minmax(0,1fr)]">
    <label class="text-sm text-ink" for={id}>{label}</label>
    <select {id} bind:value {disabled} class={control} onchange={(event) => onchange?.(event.currentTarget.value)}>
      {#each options as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    {#if hint}
      <p class="text-xs leading-5 text-faint">{hint}</p>
    {/if}
  </div>
{:else}
  <div class="flex flex-col gap-1">
    <label class="text-xs text-muted" for={id}>{label}</label>
    <select {id} bind:value {disabled} class={control} onchange={(event) => onchange?.(event.currentTarget.value)}>
      {#each options as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  </div>
{/if}
