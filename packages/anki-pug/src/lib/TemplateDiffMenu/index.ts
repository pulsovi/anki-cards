import inquirer from 'inquirer';

import type DiffConfig from '../DiffConfig';
import type MenuItem from '../MenuItem';
import type Template from '../Template';
import type { TaskSyncer } from '../util';

import No from './No';
import Quit from './Quit';
import Word from './Word';

const items: (new (template: Template) => MenuItem)[] = [
  No,
  Word,
  Quit,
];

export default class TemplateDiffMenu {
  private readonly items: MenuItem[];
  private readonly template: Template;

  public constructor (template: Template) {
    this.items = items.map(Item => new Item(template));
    this.template = template;
  }

  public async process (diffConfig: DiffConfig, ticket: TaskSyncer): Promise<void> {
    const question = {
      /* eslint-disable sort-keys */
      type: 'expand' as const,
      name: 'diffType' as const,
      message: `Compare ${this.template.getName()} ?`,
      choices: this.items.map(item => item.getChoice()),
      'default': this.items.indexOf(this.items.reduce(
        (currentDefault: MenuItem, item) => item.getDefault(currentDefault)
      )),
      /* eslint-enable sort-keys */
    };
    await ticket.ready;
    const responsePromise = inquirer.prompt(question);
    const response = await responsePromise;
    const choice = response.diffType as MenuItem;
    const solved = await choice.process(diffConfig, ticket);

    if (!solved) await this.process(diffConfig, ticket);
  }
}
