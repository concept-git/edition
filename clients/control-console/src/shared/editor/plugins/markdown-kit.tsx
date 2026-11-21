import { MarkdownPlugin } from '@platejs/markdown';
import remarkGfm from 'remark-gfm';
// The backend stores Markdown, not MDX. Enable only syntax supported by the reader.
export const MarkdownKit = [
  MarkdownPlugin.configure({ options: { remarkPlugins: [remarkGfm] } }),
];
