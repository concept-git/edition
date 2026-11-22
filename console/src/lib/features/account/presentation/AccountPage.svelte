<script lang="ts">
  import DeactivatePanel from './DeactivatePanel.svelte';
  import ErasePanel from './ErasePanel.svelte';
  import PasswordPanel from './PasswordPanel.svelte';
  import SessionsPanel from './SessionsPanel.svelte';

  let { view }: { view: 'password' | 'sessions' | 'deactivate' | 'erase' } = $props();
</script>

{#if view === 'password'}
  <PasswordPanel />
{:else if view === 'sessions'}
  <SessionsPanel />
{:else if view === 'deactivate'}
  <DeactivatePanel />
{:else}
  <ErasePanel />
{/if}
