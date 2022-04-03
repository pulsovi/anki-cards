import MenuItem from '../Menu/MenuItem';

import type TemplateDiffMenu from './TemplateDiffMenu';

export default class TemplateDiffMenuItem extends MenuItem {
  protected readonly menu: TemplateDiffMenu;
  public constructor (menu: TemplateDiffMenu) {
    super(menu);
    this.menu = menu;
  }
}
