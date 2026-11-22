<script lang="ts">
  import '../app.css';
  import Shell from '#lib/features/shell/presentation/Shell.svelte';
  import { setShellMode, ShellMode } from '#lib/features/shell/presentation/shell-mode.svelte';

  let { children } = $props();
  setShellMode(new ShellMode());
</script>

<Shell>
  {@render children()}
</Shell>
