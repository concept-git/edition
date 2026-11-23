<script lang="ts">
  import { page } from '$app/state';
  import AuthorPages from '#lib/features/content-types/presentation/AuthorPages.svelte';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import PagesPage from '#lib/features/pages/presentation/PagesPage.svelte';
  import SampleSwitch from '#lib/shared/ui/SampleSwitch.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

<SampleSwitch id={spaceId}>
  {#snippet sample()}
    <SpaceSection view="pages" />
  {/snippet}
  {#snippet real()}
    <PagesPage {spaceId} />
    <AuthorPages {spaceId} />
  {/snippet}
</SampleSwitch>
