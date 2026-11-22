<script lang="ts">
  let {
    label,
    value = $bindable(''),
    options,
    disabled = false
  }: {
    label: string;
    value?: string;
    options: Array<{ value: string; label: string }>;
    disabled?: boolean;
  } = $props();

  const id = $props.id();
</script>

<div class="flex flex-col gap-1">
  <label class="text-sm text-ink" for={id}>{label}</label>
  <select {id} bind:value {disabled} class="h-9 rounded-nav border border-line bg-surface px-3 text-sm text-ink">
    {#each options as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>
