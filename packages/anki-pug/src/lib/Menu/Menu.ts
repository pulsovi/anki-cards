import inquirer from 'inquirer';
import type { ExpandChoiceOptions, ExpandQuestion } from 'inquirer';

import type { SyncOrPromise } from '../types';

import type MenuItem from './MenuItem';

interface TaskSyncer {
  ready: Promise<void>;
}

export default class Menu<Data> {
  protected items: MenuItem<Data>[] = [];
  protected message: string;
  protected readonly syncer: TaskSyncer | null;

  public constructor (message: string, syncer: TaskSyncer | null = null) {
    this.message = message;
    this.syncer = syncer;
  }

  public async process (): Promise<void> {
    const data = await this.getData();
    const filteredData = await this.filterData(data);

    if (this.syncer) {
      const canPrompt = await this.syncer.ready.then(() => true, () => false);
      if (!canPrompt) return;
    }
    const choice = await this.getResponse();
    const solved = await choice.act(filteredData);

    if (!solved) await this.process();
  }

  protected filterData (data: Data | null): SyncOrPromise<Data | null> {
    return this.items.reduce(
      (reducedData: SyncOrPromise<Data | null>, item) => item.filterData(reducedData),
      data
    );
  }

  protected getChoices (): (ExpandChoiceOptions & { value: MenuItem<Data> })[] {
    return this.items
      .map(item => item.getChoice())
      .filter(
        (choice): choice is (ExpandChoiceOptions & { value: MenuItem<Data> }) => choice !== null
      );
  }

  protected getData (): SyncOrPromise<Data> | null {
    return null;
  }

  protected getQuestion (): ExpandQuestion<{ value: MenuItem<Data> }> {
    const choices = this.getChoices();
    const defaultChoice = choices
      .map(choice => choice.value as MenuItem<Data>)
      .reduce((currentDefault, item) => item.getDefault(currentDefault));
    const question = {
      /* eslint-disable sort-keys */
      type: 'expand' as const,
      name: 'value' as const,
      message: this.message,
      choices,
      'default': choices.findIndex(choice => choice.value === defaultChoice),
      /* eslint-enable sort-keys */
    };
    return question;
  }

  protected async getResponse (): Promise<MenuItem<Data>> {
    const question = this.getQuestion();
    const inquirerPromise = inquirer.prompt(question);
    const response = await inquirerPromise.then(choice => choice.value);
    return response;
  }
}
