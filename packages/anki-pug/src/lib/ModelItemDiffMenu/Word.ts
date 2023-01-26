import chalk from 'chalk';
import { diffWordsWithSpace } from 'diff';

import type ModelItemDiffMenu from './ModelItemDiffMenu';
import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';

export default class Word extends ModelItemDiffMenuItem {
  public constructor (menu: ModelItemDiffMenu) {
    super(menu);
    this.key = 'w';
    this.name = '[word] Show word diff';
  }

  public async act (data: [string, string]): Promise<boolean> {
    const [rawOutput, compiledPug] = data;
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
    return await Promise.resolve(false);
  }
}
