<script lang="ts">
  import OverviewPage from '#lib/features/overview/presentation/OverviewPage.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';

  const session = getSession();
</script>

<OverviewPage token={session.accessToken} />
