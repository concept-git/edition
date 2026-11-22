<script lang="ts">
  let {
    label,
    file = $bindable<File | null>(null),
    disabled = false,
    accept = '.zip,application/zip'
  }: {
    label: string;
    file?: File | null;
    disabled?: boolean;
    accept?: string;
  } = $props();

  const id = $props.id();

  function changed(event: Event) {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;
    file = input.files?.[0] ?? null;
  }
</script>

<div class="flex flex-col gap-1">
  <label class="text-sm text-ink" for={id}>{label}</label>
  <input
    {id}
    type="file"
    {accept}
    {disabled}
    onchange={changed}
    class="text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-mint file:px-3 file:py-1 file:text-sm file:text-accent"
  />
</div>
