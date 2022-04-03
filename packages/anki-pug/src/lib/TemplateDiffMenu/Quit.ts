import type TemplateDiffMenu from './TemplateDiffMenu';
import TemplateDiffMenuItem from './TemplateDiffMenuItem';

export default class Quit extends TemplateDiffMenuItem {
  protected readonly key: string;
  protected readonly name: string;

  public constructor (menu: TemplateDiffMenu) {
    super(menu);
    this.key = 'q';
    this.name = '[quit] Skip all unmanaged models/templates and quit the diff';
  }

  public async act (): Promise<boolean> {
    this.menu.getDiffConfig().haveToQuit(true);
    return await Promise.resolve(true);
  }
}
