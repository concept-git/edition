<script lang="ts">
  let {
    label,
    checked = false,
    disabled = false,
    onchange
  }: {
    label: string;
    checked?: boolean;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
  } = $props();

  const id = $props.id();

  function changed(event: Event) {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) onchange?.(input.checked);
  }
</script>

<div class="flex items-center gap-2">
  <input {id} type="checkbox" {checked} {disabled} onchange={changed} />
  <label class="text-sm text-ink" for={id}>{label}</label>
</div>
