<script lang="ts">
  import { javascript } from '@codemirror/lang-javascript';
  import { EditorState, type Extension } from '@codemirror/state';
  import { EditorView, basicSetup } from 'codemirror';
  import type { Attachment } from 'svelte/attachments';

  let {
    value = $bindable(''),
    label = '源码',
    language = 'javascript'
  }: {
    value?: string;
    label?: string;
    language?: 'javascript' | 'text';
  } = $props();

  const mount: Attachment<HTMLDivElement> = (host) => {
    let applying = false;
    const languageExtension: Extension = language === 'javascript' ? javascript() : [];
    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: '',
        extensions: [
          basicSetup,
          languageExtension,
          EditorView.contentAttributes.of({ 'aria-label': label }),
          EditorView.theme({
            '&': { minHeight: '16rem', backgroundColor: 'transparent' },
            '.cm-scroller': {
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              fontSize: '13px'
            },
            '.cm-content': { minHeight: '16rem' },
            '&.cm-focused': { outline: 'none' }
          }),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged || applying) return;
            value = update.state.doc.toString();
          })
        ]
      })
    });

    $effect(() => {
      const next = value;
      const current = view.state.doc.toString();
      if (next === current) return;
      applying = true;
      view.dispatch({ changes: { from: 0, to: current.length, insert: next } });
      applying = false;
    });

    return () => view.destroy();
  };
</script>

<div class="overflow-hidden rounded-nav border border-line bg-surface" {@attach mount}></div>
