'use client';

import { CodeBlockRules } from '@platejs/code-block';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@platejs/code-block/react';
import { createLowlight } from 'lowlight';

import {
  CodeBlockElement,
  CodeLineElement,
  CodeSyntaxLeaf,
} from '@/shared/ui/code-block-node';

const lowlight = createLowlight();

export const CodeBlockKit = [
  CodeBlockPlugin.configure({
    inputRules: [CodeBlockRules.markdown({ on: 'match' })],
    node: { component: CodeBlockElement },
    options: { lowlight },
    shortcuts: { toggle: { keys: 'mod+alt+8' } },
  }),
  CodeLinePlugin.withComponent(CodeLineElement),
  CodeSyntaxPlugin.withComponent(CodeSyntaxLeaf),
];
