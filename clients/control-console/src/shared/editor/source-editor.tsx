import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';

export function SourceEditor({
  value,
  language,
  readOnly = false,
  change,
}: {
  value: string;
  language: string;
  readOnly?: boolean;
  change: (value: string) => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChange = useRef(change);
  onChange.current = change;
  useEffect(() => {
    if (!mount.current) return;
    const syntax = { markdown, html, json, xml }[language];
    const editor = new EditorView({
      parent: mount.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          ...(syntax ? [syntax()] : []),
          EditorState.readOnly.of(readOnly),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ 'aria-label': '源码正文' }),
          EditorView.theme({
            '&': {
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              minHeight: '420px',
            },
            '.cm-content': { fontFamily: 'ui-monospace, monospace' },
            '.cm-gutters': {
              backgroundColor: 'var(--muted)',
              color: 'var(--muted-foreground)',
              borderColor: 'var(--border)',
            },
            '.cm-activeLine': { backgroundColor: 'var(--muted)' },
            '.cm-cursor': { borderLeftColor: 'var(--foreground)' },
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged)
              onChange.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
  }, [language, readOnly]);
  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== value)
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: value },
      });
  }, [value]);
  return <div ref={mount} className="max-w-full overflow-hidden text-sm" />;
}
