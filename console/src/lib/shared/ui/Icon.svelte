<script lang="ts">
  let { name }: { name: string } = $props();

  const paths: Record<string, string> = {
    overview: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z',
    members: 'M16 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-2.2-2.9M16 5.1a3 3 0 0 1 0 5.8',
    integration: 'M9 7V4m6 3V4M8 20h8a2 2 0 0 0 2-2V8H6v10a2 2 0 0 0 2 2M10 12h4',
    analytics: 'M4 19V5M4 19h16M8 16v-4M12 16V8M16 16v-6',
    audit: 'M8 6h11M8 12h11M8 18h11M5 6h.01M5 12h.01M5 18h.01',
    settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M12 3.5v2M12 18.5v2M4.9 6.5l1.7 1M17.4 16.5l1.7 1M3.5 12h2M18.5 12h2M4.9 17.5l1.7-1M17.4 7.5l1.7-1',
    content: 'M7 3.5h7l5 5V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1M14 3.5V9h5',
    sites: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3c2.2 2.4 3.4 5.6 3.4 9S14.2 18.6 12 21c-2.2-2.4-3.4-5.6-3.4-9S9.8 5.4 12 3',
    platform: 'M4 6.5h16v4H4zM4 13.5h16v4H4zM7 8.5h.01M7 15.5h.01'
  };
</script>

<svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d={paths[name] ?? paths.overview} />
</svg>
