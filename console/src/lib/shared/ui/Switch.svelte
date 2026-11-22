<script lang="ts">
  import { Switch } from 'bits-ui';

  let {
    label,
    checked = $bindable(false),
    disabled = false,
    onCheckedChange
  }: {
    label: string;
    checked?: boolean;
    disabled?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  } = $props();

  const labelId = $props.id();
</script>

<div class="flex items-center gap-3">
  <span id={labelId} class="text-sm text-ink">{label}</span>
  <Switch.Root
    bind:checked
    {disabled}
    {onCheckedChange}
    aria-labelledby={labelId}
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-line data-[state=checked]:bg-accent"
  >
    <Switch.Thumb class="block size-5 rounded-full bg-white data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-5" />
  </Switch.Root>
</div>
