import type { NavNode } from "../../site/index.ts";
import { pageLinks } from "../../site/index.ts";

export interface SequenceLink {
  label: string;
  href: string;
}
export interface Sequence {
  previous: SequenceLink | null;
  next: SequenceLink | null;
}

const link = (node: NavNode | undefined): SequenceLink | null =>
  node && node.href ? { label: node.label, href: node.href } : null;

/** 上一页/下一页按导航树中带页面节点的文档顺序确定。 */
export function sequenceOf(navigation: NavNode[], pageId: string): Sequence {
  const links = pageLinks(navigation);
  const index = links.findIndex((node) => node.pageId === pageId);
  if (index < 0) return { previous: null, next: null };
  return { previous: link(links[index - 1]), next: link(links[index + 1]) };
}
