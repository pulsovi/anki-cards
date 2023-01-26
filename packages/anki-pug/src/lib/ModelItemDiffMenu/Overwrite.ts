import type ModelItemDiffMenu from './ModelItemDiffMenu';
import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';

export default class Overwrite extends ModelItemDiffMenuItem {
  protected readonly key: string;
  protected readonly name: string;

  public constructor (menu: ModelItemDiffMenu) {
    super(menu);
    this.key = 'o';
    this.name = '[overwrite] Overwrite Anki model item with parsed pug content';
  }

  public async act (): Promise<boolean> {
    const modelItem = this.menu.getModelItem();
    const data = await modelItem.getCompiledPug();

    await modelItem.setAnki(data);
    return true;
  }
}
