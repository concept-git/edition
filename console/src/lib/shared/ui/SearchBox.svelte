<script lang="ts">
  let {
    label,
    value = $bindable(''),
    placeholder = ''
  }: {
    label: string;
    value?: string;
    placeholder?: string;
  } = $props();

  const id = $props.id();
</script>

<div class="w-56">
  <label class="sr-only" for={id}>{label}</label>
  <input
    {id}
    type="search"
    {placeholder}
    bind:value
    class="h-8 w-full rounded-nav border border-stroke bg-surface px-3 text-sm text-ink placeholder:text-faint"
  />
</div>
