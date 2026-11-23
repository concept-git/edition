import type { TransitionConfig } from 'svelte/transition';

/** Keep the shell still. Open and close motion lives on menus, groups, and dialogs. */
export function shellEnter(_node: Element): TransitionConfig {
  return { duration: 0 };
}
