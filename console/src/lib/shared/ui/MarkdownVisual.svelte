<script lang="ts">
  import type { Attachment } from 'svelte/attachments';
  import type { Crepe } from '@milkdown/crepe';

  let {
    value = $bindable(''),
    label = '正文',
    onready
  }: {
    value?: string;
    label?: string;
    onready?: (flush: (() => string) | null) => void;
  } = $props();

  const mount: Attachment<HTMLDivElement> = (host) => {
    let cancelled = false;
    let editor: Crepe | null = null;
    let baseline = '';
    const starting = value;

    const flush = () => {
      if (!editor) return starting;
      try {
        const markdown = editor.getMarkdown();
        if (markdown === baseline) return starting;
        const readable = markdownText(markdown);
        value = readable;
        return readable;
      } catch {
        return value;
      }
    };

    void (async () => {
      const [{ Crepe }] = await Promise.all([
        import('@milkdown/crepe'),
        import('@milkdown/crepe/theme/common/style.css')
      ]);
      if (cancelled) return;
      const created = new Crepe({
        root: host,
        defaultValue: starting,
        features: {
          [Crepe.Feature.Latex]: false,
          [Crepe.Feature.AI]: false,
          [Crepe.Feature.TopBar]: true
        },
        featureConfigs: {
          [Crepe.Feature.Placeholder]: { text: '开始写正文', mode: 'doc' },
          [Crepe.Feature.Toolbar]: {
            boldLabel: '粗体',
            italicLabel: '强调',
            strikethroughLabel: '删除线',
            codeLabel: '行内代码',
            linkLabel: '链接'
          },
          [Crepe.Feature.TopBar]: {
            headingOptions: [
              { label: '段落', level: null },
              { label: '标题 1', level: 1 },
              { label: '标题 2', level: 2 },
              { label: '标题 3', level: 3 },
              { label: '标题 4', level: 4 },
              { label: '标题 5', level: 5 },
              { label: '标题 6', level: 6 }
            ]
          }
        }
      });
      created.on((listener) => {
        listener.markdownUpdated((_ctx, markdown) => {
          if (!editor || markdown === baseline) return;
          value = markdown;
        });
      });
      await created.create();
      if (cancelled) {
        await created.destroy();
        return;
      }
      baseline = created.getMarkdown();
      editor = created;
      onready?.(flush);
      const surface = host.querySelector('.ProseMirror');
      if (surface instanceof HTMLElement) surface.setAttribute('aria-label', label);
      labelTopBar(host);
    })();

    return () => {
      cancelled = true;
      onready?.(null);
      const markdown = editor ? flush() : starting;
      if (markdown !== starting) value = markdown;
      const current = editor;
      editor = null;
      if (current) void current.destroy();
    };
  };

  function markdownText(markdown: string) {
    return markdown
      .split('\n')
      .map((line) => (/^\s*<br\s*\/?\s*>\s*$/i.test(line) ? '' : line))
      .join('\n');
  }

  function labelTopBar(host: HTMLElement) {
    const labels = ['粗体', '强调', '删除线', '行内代码', '无序列表', '有序列表', '任务列表', '链接', '图片', '表格', '代码块', '引用', '分隔线'];
    const buttons = [...host.querySelectorAll('.top-bar-item')];
    if (buttons.length !== labels.length) return;
    buttons.forEach((button, index) => {
      button.setAttribute('aria-label', labels[index]);
    });
  }
</script>

<div class="markdown-visual overflow-hidden rounded-nav border border-line bg-surface" {@attach mount}></div>

<style>
  .markdown-visual :global(.milkdown) {
    --crepe-color-background: transparent;
    --crepe-color-on-background: var(--edition-ink);
    --crepe-color-surface: var(--edition-canvas);
    --crepe-color-on-surface: var(--edition-ink);
    --crepe-color-on-surface-variant: var(--edition-muted);
    --crepe-color-outline: var(--edition-line);
    --crepe-color-primary: var(--edition-accent);
    --crepe-color-hover: var(--edition-mint);
    --crepe-color-selected: var(--edition-mint);
    --crepe-font-default: var(--font-sans);
    --crepe-font-title: var(--font-sans);
    --crepe-base-font-size: 14px;
    min-height: 16rem;
    background: transparent;
  }

  .markdown-visual :global(.ProseMirror) {
    min-height: 16rem;
    padding: 0.75rem 1rem;
  }

  .markdown-visual :global(.milkdown :focus-visible) {
    outline: 2px solid var(--edition-accent);
    outline-offset: 2px;
  }
</style>
