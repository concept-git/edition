import { animate, animateLayout } from 'motion';
import type { TransitionConfig } from 'svelte/transition';

const entrance = { duration: 0.18, ease: 'easeOut' as const };

/** Entrance for a shell that just mounted. Reduced motion does not move it. */
export function shellEnter(node: Element): TransitionConfig {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return { duration: 0 };
  animateLayout(node, () => undefined, entrance);
  animate(node, { transform: ['translate(12px, 0px)', 'translate(0px, 0px)'] }, entrance);
  return { duration: 0 };
}
