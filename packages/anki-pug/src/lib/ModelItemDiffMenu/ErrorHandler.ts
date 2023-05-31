import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';
import { modelItemToString } from './util';

import type { ModelItemPair } from '.';

export default class ErrorHandler extends ModelItemDiffMenuItem {
  public async act (data: ModelItemPair): Promise<boolean> {
    data.forEach(item => { if (item instanceof Error) console.log(item, '\n'); });
    return await Promise.resolve(true);
  }

  public getSyncResponse (data: ModelItemPair): this | null {
    if (data.some(item => item instanceof Error)) return this;
    return null;
  }
}
