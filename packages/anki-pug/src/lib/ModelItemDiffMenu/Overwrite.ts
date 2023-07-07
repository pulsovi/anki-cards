import { todo } from '../util';

import type ModelItemDiffMenu from './ModelItemDiffMenu';
import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';

import type { ModelItemPair } from '.';

export default class Overwrite extends ModelItemDiffMenuItem {
  protected readonly key: string;
  protected readonly name: string;

  public constructor (menu: ModelItemDiffMenu) {
    super(menu);
    this.key = 'o';
    this.name = '[overwrite] Overwrite Anki model item with parsed pug content';
  }

  public async act ([_anki, pug]: ModelItemPair): Promise<boolean> {
    if (!pug || pug instanceof Error) return !todo();
    const modelItem = this.menu.getModelItem();

    await modelItem.setAnki(pug);
    return true;
  }
}
