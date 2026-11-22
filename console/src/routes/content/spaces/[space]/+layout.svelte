<script lang="ts">
  import SpaceFrame from '#lib/features/content/presentation/SpaceFrame.svelte';
  import AutoRelease from '#lib/features/spaces/presentation/AutoRelease.svelte';
  import OpenedSpace from '#lib/features/spaces/presentation/OpenedSpace.svelte';

  let { data, children: pageChildren } = $props();
</script>

{#if data.spaceId === 'example'}
  <SpaceFrame spaceId={data.spaceId}>
    {@render pageChildren()}
  </SpaceFrame>
{:else}
  {#key data.spaceId}
    <OpenedSpace spaceId={data.spaceId}>
      {#snippet children(view)}
        <SpaceFrame spaceId={data.spaceId} title={view.name}>
          {#snippet controls()}
            {#if view.autoRelease !== null}
              <AutoRelease tenantId={view.tenantId} spaceId={view.id} saved={view.autoRelease} />
            {/if}
          {/snippet}
          {@render pageChildren()}
        </SpaceFrame>
      {/snippet}
    </OpenedSpace>
  {/key}
{/if}
