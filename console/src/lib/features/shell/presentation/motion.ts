import type { TransitionConfig } from 'svelte/transition';

export function shellEnter(node: Element): TransitionConfig {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return { duration: 0 };
  node.animate([{ transform: 'translate(12px, 0px)' }, { transform: 'translate(0px, 0px)' }], {
    duration: 180,
    easing: 'ease-out',
    fill: 'both'
  });
  return { duration: 0 };
}
