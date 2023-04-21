import MenuItem from '../Menu/MenuItem';

import type ModelItemDiffMenu from './ModelItemDiffMenu';

import type { ModelItemPair } from '.';

export default class ModelItemDiffMenuItem extends MenuItem<ModelItemPair> {
  protected readonly menu: ModelItemDiffMenu;

  public constructor (menu: ModelItemDiffMenu) {
    super(menu);
    this.menu = menu;
  }
}
