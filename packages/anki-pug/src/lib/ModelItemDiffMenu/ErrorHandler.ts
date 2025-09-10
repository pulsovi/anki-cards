import inquirer from 'inquirer';

import { todo } from '../util';

import ModelItemDiffMenuItem from './ModelItemDiffMenuItem';

import type { ModelItemPair } from '.';

export default class ErrorHandler extends ModelItemDiffMenuItem {
  public async act (data: ModelItemPair): Promise<boolean> {
    console.info('ERROR HANDLER ACT');
    data.forEach(item => { if (item instanceof Error) console.info(item, '\n'); });

    const response = await inquirer.prompt({
      message: 'Reessayer ?',
      name: 'error handler',
      type: 'confirm',
    });
    console.info({ response });
    todo();
  }

  public getSyncResponse (data: ModelItemPair): this | null {
    if (data.some(item => item instanceof Error)) return this;
    return null;
  }
}
