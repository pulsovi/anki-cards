import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';
import { modelItemToString } from './util';

import type { ModelItemPair } from '.';

export default class NoDiffResponse extends ModelItemDiffMenuItem {
  public async act (): Promise<boolean> {
    return await Promise.resolve(true);
  }

  public getSyncResponse (data: ModelItemPair): this | null {
    const modelItem = this.menu.getModelItem();
    if (modelItem.contentType !== 'text') return null;
    const [pugRendered, html] = data.map(modelItemToString);
    if (pugRendered === html) return this;
    return null;
  }
}
