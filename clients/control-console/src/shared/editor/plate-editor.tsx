import { useEffect, useRef, useState } from 'react';
import { MarkdownPlugin } from '@platejs/markdown';
import { createSlateEditor, ElementApi, normalizeStaticValue } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import { serializeHtml } from 'platejs/static';
import { Bold, Italic, Code, Heading1, Heading2, Quote } from 'lucide-react';
import { BasicNodesKit } from './plugins/basic-nodes-kit';
import { MarkdownKit } from './plugins/markdown-kit';
import { TableKit } from './plugins/table-kit';
import { LinkKit } from './plugins/link-kit';
import { ListKit } from './plugins/list-kit';
import { CodeBlockKit } from './plugins/code-block-kit';
import { BaseBasicBlocksKit } from './plugins/basic-blocks-base-kit';
import { BaseBasicMarksKit } from './plugins/basic-marks-base-kit';
import { BaseTableKit } from './plugins/table-base-kit';
import { BaseLinkKit } from './plugins/link-base-kit';
import { BaseListKit } from './plugins/list-base-kit';
import { BaseCodeBlockKit } from './plugins/code-block-base-kit';
import { Failure } from '@/shared/ui/feedback';
import { Editor, EditorContainer } from '@/shared/ui/editor';
import { Toolbar, ToolbarButton } from '@/shared/ui/toolbar';
import { MarkToolbarButton } from '@/shared/ui/mark-toolbar-button';
import { TableToolbarButton } from '@/shared/ui/table-toolbar-button';
import { LinkToolbarButton } from '@/shared/ui/link-toolbar-button';
import {
  BulletedListToolbarButton,
  NumberedListToolbarButton,
} from '@/shared/ui/list-toolbar-button';

export function PlateEditor({
  initial,
  format,
  readOnly,
  change,
  pending,
}: {
  initial: string;
  format: string;
  readOnly: boolean;
  change: (value: string) => void;
  pending: (value: boolean) => void;
}) {
  const generation = useRef(0);
  const [error, setError] = useState<unknown>();
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current++;
    };
  }, []);
  const editor = usePlateEditor({
    plugins: [
      ...BasicNodesKit,
      ...TableKit,
      ...LinkKit,
      ...ListKit,
      ...CodeBlockKit,
      ...MarkdownKit,
    ],
    value: (editor) =>
      format === 'html'
        ? normalizeStaticValue(
            editor.api.html
              .deserialize({ element: initial })
              .map((node) =>
                ElementApi.isElement(node)
                  ? node
                  : { type: 'p', children: [node] },
              ),
          )
        : editor.getApi(MarkdownPlugin).markdown.deserialize(initial),
  });
  return (
    <Plate
      editor={editor}
      readOnly={readOnly}
      onValueChange={async () => {
        const current = ++generation.current;
        setError(undefined);
        pending(true);
        try {
          const value =
            format === 'html'
              ? await serializeHtml(
                  createSlateEditor({
                    plugins: [
                      ...BaseBasicBlocksKit,
                      ...BaseBasicMarksKit,
                      ...BaseTableKit,
                      ...BaseLinkKit,
                      ...BaseListKit,
                      ...BaseCodeBlockKit,
                    ],
                    value: editor.children,
                  }),
                )
              : editor.getApi(MarkdownPlugin).markdown.serialize();
          if (alive.current && current === generation.current) change(value);
        } catch (failure) {
          if (alive.current && current === generation.current)
            setError(failure);
        } finally {
          if (alive.current && current === generation.current) pending(false);
        }
      }}
    >
      {error !== undefined && <Failure error={error} />}
      <Toolbar
        className="sticky top-0 z-10 flex flex-wrap gap-1 border-b bg-background p-2"
        aria-label="文档格式"
      >
        <MarkToolbarButton nodeType="bold" tooltip="加粗" aria-label="加粗">
          <Bold />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="italic" tooltip="斜体" aria-label="斜体">
          <Italic />
        </MarkToolbarButton>
        <MarkToolbarButton
          nodeType="code"
          tooltip="行内代码"
          aria-label="行内代码"
        >
          <Code />
        </MarkToolbarButton>
        <ToolbarButton
          aria-label="一级标题"
          onClick={() => editor.tf.setNodes({ type: 'h1' })}
        >
          <Heading1 />
        </ToolbarButton>
        <ToolbarButton
          aria-label="二级标题"
          onClick={() => editor.tf.setNodes({ type: 'h2' })}
        >
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton
          aria-label="引用"
          onClick={() => editor.tf.setNodes({ type: 'blockquote' })}
        >
          <Quote />
        </ToolbarButton>
        <BulletedListToolbarButton />
        <NumberedListToolbarButton />
        <LinkToolbarButton />
        <TableToolbarButton />
      </Toolbar>
      <EditorContainer className="min-h-[420px]">
        <Editor
          variant="none"
          className="min-h-[420px] px-5 py-6 md:px-10"
          aria-label="页面正文"
          placeholder="开始编写内容…"
        />
      </EditorContainer>
    </Plate>
  );
}
