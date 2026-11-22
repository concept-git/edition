<script lang="ts">
  import { html } from '@codemirror/lang-html';
  import { javascript } from '@codemirror/lang-javascript';
  import { json } from '@codemirror/lang-json';
  import { markdown } from '@codemirror/lang-markdown';
  import { xml } from '@codemirror/lang-xml';
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
    language?: 'javascript' | 'markdown' | 'html' | 'txt' | 'json' | 'xml' | 'text';
  } = $props();

  const mount: Attachment<HTMLDivElement> = (host) => {
    let applying = false;
    const languageExtension: Extension = languageOf(language);
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

  function languageOf(kind: string): Extension {
    if (kind === 'javascript') return javascript();
    if (kind === 'markdown') return markdown();
    if (kind === 'html') return html();
    if (kind === 'json') return json();
    if (kind === 'xml') return xml();
    return [];
  }
</script>

<div class="overflow-hidden rounded-nav border border-line bg-surface" {@attach mount}></div>
