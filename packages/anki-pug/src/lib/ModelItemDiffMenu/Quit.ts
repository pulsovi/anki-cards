import type ModelItemDiffMenu from './ModelItemDiffMenu';
import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';

export default class Quit extends ModelItemDiffMenuItem {
  protected readonly key: string;
  protected readonly name: string;

  public constructor (menu: ModelItemDiffMenu) {
    super(menu);
    this.key = 'q';
    this.name = '[quit] Skip all unmanaged models/templates and quit the diff';
  }

  public async act (): Promise<boolean> {
    this.menu.getDiffConfig().haveToQuit(true);
    return await Promise.resolve(true);
  }
}
