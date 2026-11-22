<script lang="ts">
  let {
    label,
    value = $bindable(''),
    type = 'text',
    name,
    autocomplete,
    required = false,
    disabled = false
  }: {
    label: string;
    value?: string;
    type?: 'text' | 'email' | 'password';
    name?: string;
    autocomplete?: 'username' | 'current-password';
    required?: boolean;
    disabled?: boolean;
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
    class="h-9 rounded-nav border border-line bg-surface px-3 text-sm text-ink"
  />
</div>
