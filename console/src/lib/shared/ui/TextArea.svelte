<script lang="ts">
  let {
    label,
    value = $bindable(''),
    required = false,
    disabled = false,
    error = ''
  }: {
    label: string;
    value?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
  } = $props();

  const id = $props.id();
</script>

<div class="flex flex-col gap-1">
  <label class="text-sm text-ink" for={id}>{label}</label>
  <textarea
    {id}
    {required}
    {disabled}
    bind:value
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? `${id}-error` : undefined}
    class="min-h-24 rounded-nav border border-line bg-surface px-3 py-2 text-sm text-ink"
  ></textarea>
  {#if error}
    <p id={`${id}-error`} class="text-sm text-danger">{error}</p>
  {/if}
</div>
