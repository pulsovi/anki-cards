import { run } from '../util/run';
import { todo } from '../util/todo';

import type ModelItemDiffMenu from './ModelItemDiffMenu';
import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';

export default class Source extends ModelItemDiffMenuItem {
  protected readonly key: string;
  protected readonly name: string;

  public constructor (menu: ModelItemDiffMenu) {
    super(menu);
    this.key = 's';
    this.name = '[source] Open source file in editor';
  }

  public async act (): Promise<boolean> {
    const modelItem = this.menu.getModelItem();
    const file = modelItem.src;

    editor(file);
    return await Promise.resolve(false);
  }
}

/** Open given file by realpath in sublime-text editor */
function editor (file: string): void {
  console.log(file);
  todo('"sublime_text" n est pas une commande standard, il devrait être remplacé par une option de configuration');
  run(`"sublime_text" "${file}"`);
}
