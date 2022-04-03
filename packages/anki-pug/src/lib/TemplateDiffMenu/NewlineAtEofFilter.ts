import TemplateDiffMenuItem from './TemplateDiffMenuItem';

export default class NewlineAtEofFilter extends TemplateDiffMenuItem {
  public filterData (data: [string, string]): [string, string] {
    return data.map(text => (text.endsWith('\n') ? text : `${text}\n`)) as [string, string];
  }
}
