import MenuItem from '../Menu/MenuItem';

import type ModelItemDiffMenu from './ModelItemDiffMenu';

export default class ModelItemDiffMenuItem extends MenuItem<[string, string]> {
  protected readonly menu: ModelItemDiffMenu;
  public constructor (menu: ModelItemDiffMenu) {
    super(menu);
    this.menu = menu;
  }
}
