<script lang="ts">
  let {
    label,
    value = $bindable(''),
    type = 'text',
    name,
    autocomplete,
    required = false,
    disabled = false,
    error = ''
  }: {
    label: string;
    value?: string;
    type?: 'text' | 'email' | 'password';
    name?: string;
    autocomplete?: 'username' | 'current-password' | 'new-password';
    required?: boolean;
    disabled?: boolean;
    error?: string;
  } = $props();

  const id = $props.id();
</script>

<div class="flex flex-col gap-1">
  <label class="text-sm text-ink" for={id}>{label}</label>
  <input
    {id}
    {name}
    {type}
    {autocomplete}
    {required}
    {disabled}
    bind:value
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? `${id}-error` : undefined}
    class="h-9 rounded-nav border border-line bg-surface px-3 text-sm text-ink"
  />
  {#if error}
    <p id={`${id}-error`} class="text-sm text-danger">{error}</p>
  {/if}
</div>
