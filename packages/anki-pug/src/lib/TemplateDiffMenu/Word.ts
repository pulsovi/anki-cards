import chalk from 'chalk';
import { diffWordsWithSpace } from 'diff';

import MenuItem from '../MenuItem';
import type Template from '../Template';

export default class Word extends MenuItem {
  protected readonly key: string;
  protected readonly name: string;

  public constructor (template: Template) {
    super(template);
    this.key = 'w';
    this.name = '[word] Show word diff';
  }

  public async process (): Promise<boolean> {
    const [rawOutput, compiledPug] = await Promise.all([
      this.template.getCurrentOutput(),
      this.template.getCompiledPug(),
    ]).then(contents => contents.map(content => {
      let text = content;
      if (text === null) text = '';
      // if (!text.endsWith('\n')) text = `${text}\n<NO NEWLINE AT END OF FILE>`;
      return text;
    }));
    const diffString = diffWordsWithSpace(rawOutput, compiledPug).reduce((reduced: string, chunk) => {
      if (chunk.added || chunk.removed) {
        let { value } = chunk;
        if ((/^\s+$/u).test(value)) {
          value = value
            .replace(/\r/gu, '<[CR]>')
            .replace(/\n/gu, '<[LF]>')
            .replace(/\t/gu, '<[TAB]>')
            .replace(/ /gu, '<[SPACE]>');
        }
        if (chunk.added) return `${reduced}${chalk.green(value)}`;
        if (chunk.removed) return `${reduced}${chalk.red(value)}`;
      }
      const value = chunk.value
        .split('\n\n')
        .filter((el, index, array) => index === 0 || index === array.length - 1)
        .join('\n\n');
      return `${reduced}${value}`;
    }, '');

    console.info(diffString);
    return false;
  }
}
