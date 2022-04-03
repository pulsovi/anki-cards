import type TemplateDiffMenu from './TemplateDiffMenu';
import TemplateDiffMenuItem from './TemplateDiffMenuItem';

export default class No extends TemplateDiffMenuItem {
  public constructor (menu: TemplateDiffMenu) {
    super(menu);
    this.key = 'n';
    this.name = '[no]   Skip this template';
  }

  public async act (): Promise<boolean> {
    return await Promise.resolve(true);
  }
}
