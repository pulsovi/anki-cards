import fs from 'fs-extra';

import type TemplateDiffMenu from './TemplateDiffMenu';
import TemplateDiffMenuItem from './TemplateDiffMenuItem';

export default class Overwrite extends TemplateDiffMenuItem {
  protected readonly key: string;
  protected readonly name: string;

  public constructor (menu: TemplateDiffMenu) {
    super(menu);
    this.key = 'o';
    this.name = '[overwrite] Overwrite output file with parsed template content';
  }

  public async act (): Promise<boolean> {
    const template = this.menu.getTemplate();
    const filename = template.getOutputPath();
    const data = await template.getCompiledPug();

    await fs.writeFile(filename, data, 'utf8');
    return true;
  }
}
