import { createContext } from 'svelte';

export class ShellMode {
  stickToModule = $state(false);
  sectionFolded = $state(false);

  preferModule() {
    this.stickToModule = true;
  }

  preferOverview() {
    this.stickToModule = false;
  }

  setSectionFolded(folded: boolean) {
    this.sectionFolded = folded;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('edition.section-folded', folded ? '1' : '0');
    }
  }
}

export const [getShellMode, setShellMode] = createContext<ShellMode>();
