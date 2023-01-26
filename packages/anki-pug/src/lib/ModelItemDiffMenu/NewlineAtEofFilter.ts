import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';

export default class NewlineAtEofFilter extends ModelItemDiffMenuItem {
  public filterData (data: [string, string]): [string, string] {
    return data.map(text => (text.endsWith('\n') ? text : `${text}\n`)) as [string, string];
  }
}
