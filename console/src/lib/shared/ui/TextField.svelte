<script lang="ts">
  let {
    label,
    value = $bindable(''),
    type = 'text',
    name,
    autocomplete,
    required = false,
    disabled = false,
    error = '',
    layout = 'stack',
    hint = ''
  }: {
    label: string;
    value?: string;
    type?: 'text' | 'email' | 'password';
    name?: string;
    autocomplete?: 'username' | 'current-password' | 'new-password';
    required?: boolean;
    disabled?: boolean;
    error?: string;
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
      class={control}
    />
    {#if hint}
      <p class="text-xs leading-5 text-faint">{hint}</p>
    {/if}
    {#if error}
      <p id={`${id}-error`} class="text-sm text-danger sm:col-start-2">{error}</p>
    {/if}
  </div>
{:else}
  <div class="flex flex-col gap-1">
    <label class="text-xs text-muted" for={id}>{label}</label>
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
      class={control}
    />
    {#if error}
      <p id={`${id}-error`} class="text-sm text-danger">{error}</p>
    {/if}
  </div>
{/if}
