import { createContext } from 'svelte';

export class ShellMode {
  stickToModule = $state(false);

  preferModule() {
    this.stickToModule = true;
  }

  preferOverview() {
    this.stickToModule = false;
  }
}

export const [getShellMode, setShellMode] = createContext<ShellMode>();
