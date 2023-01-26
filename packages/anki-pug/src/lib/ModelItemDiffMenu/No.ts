import type ModelItemDiffMenu from './ModelItemDiffMenu';
import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';

export default class No extends ModelItemDiffMenuItem {
  public constructor (menu: ModelItemDiffMenu) {
    super(menu);
    this.key = 'n';
    this.name = '[no]   Skip this template';
  }

  public async act (): Promise<boolean> {
    return await Promise.resolve(true);
  }
}
