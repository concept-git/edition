<script lang="ts">
  import MemberDirectory from './MemberDirectory.svelte';
  import TeamDirectory from './TeamDirectory.svelte';

  let { view }: { view: 'members' | 'teams' } = $props();
</script>

{#if view === 'members'}
  <MemberDirectory />
{:else}
  <TeamDirectory />
{/if}
