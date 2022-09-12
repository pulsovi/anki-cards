import type TemplateDiffMenu from './TemplateDiffMenu';
import TemplateDiffMenuItem from './TemplateDiffMenuItem';

export default class Overwrite extends TemplateDiffMenuItem {
  protected readonly key: string;
  protected readonly name: string;

  public constructor (menu: TemplateDiffMenu) {
    super(menu);
    this.key = 'o';
    this.name = '[overwrite] Overwrite Anki template with parsed pug content';
  }

  public async act (): Promise<boolean> {
    const template = this.menu.getTemplate();
    const data = await template.getCompiledPug();

    await template.setAnki(data);
    return true;
  }
}
