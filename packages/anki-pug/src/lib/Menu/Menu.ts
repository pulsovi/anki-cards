import inquirer from 'inquirer';

import type { SyncOrPromise } from '../types';

import type MenuItem from './MenuItem';
import type { MenuChoiceOption } from './MenuItem';

interface TaskSyncer {
  ready: Promise<void>;
}

export default class Menu {
  protected items: MenuItem[] = [];
  protected message: string;
  protected readonly syncer: TaskSyncer | null;

  public constructor (message: string, syncer: TaskSyncer | null = null) {
    this.message = message;
    this.syncer = syncer;
  }

  public async process (): Promise<void> {
    const data = await this.getData();
    const choice = await this.getResponse();
    const solved = await choice.act(data);

    if (!solved) await this.process();
  }

  protected getChoices (): MenuChoiceOption[] {
    return this.items
      .map(item => item.getChoice())
      .filter((choice): choice is MenuChoiceOption => choice !== null);
  }

  protected getData (): SyncOrPromise<unknown> {
    return null;
  }

  protected async getResponse (): Promise<MenuItem> {
    const question = {
      /* eslint-disable sort-keys */
      type: 'expand' as const,
      name: 'value' as const,
      message: this.message,
      choices: this.getChoices(),
      'default': this.items.indexOf(this.items.reduce(
        (currentDefault: MenuItem, item) => item.getDefault(currentDefault)
      )),
      /* eslint-enable sort-keys */
    };
    if (this.syncer) await this.syncer.ready;
    const responsePromise = inquirer.prompt(question);
    const response = await responsePromise;
    const choice = response.value as MenuItem;
    return choice;
  }
}
