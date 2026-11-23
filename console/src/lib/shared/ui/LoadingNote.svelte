<script lang="ts">
  let { text = '正在读取' }: { text?: string } = $props();
</script>

<p class="text-xs text-muted">{text}</p>
