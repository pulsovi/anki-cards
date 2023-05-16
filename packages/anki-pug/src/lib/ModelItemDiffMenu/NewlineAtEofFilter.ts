import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';
import { isStringPair } from './util';

export default class NewlineAtEofFilter extends ModelItemDiffMenuItem {
  public filterData (data: [string, string]): [string, string];
  public filterData (data: unknown): unknown {
    if (!isStringPair(data)) return data;
    return data.map(text => (text.endsWith('\n') ? text : `${text}\n`)) as [string, string];
  }
}
