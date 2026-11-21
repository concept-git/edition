import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@platejs/code-block';
import { createLowlight } from 'lowlight';

import {
  CodeBlockElementStatic,
  CodeLineElementStatic,
  CodeSyntaxLeafStatic,
} from '@/shared/ui/code-block-node-static';

const lowlight = createLowlight();

export const BaseCodeBlockKit = [
  BaseCodeBlockPlugin.configure({
    node: { component: CodeBlockElementStatic },
    options: { lowlight },
  }),
  BaseCodeLinePlugin.withComponent(CodeLineElementStatic),
  BaseCodeSyntaxPlugin.withComponent(CodeSyntaxLeafStatic),
];
