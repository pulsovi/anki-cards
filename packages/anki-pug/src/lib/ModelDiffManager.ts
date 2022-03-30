import path from 'path';

import chalk from 'chalk';
import inquirer from 'inquirer';

import type DiffConfig from './DiffConfig';
import type Model from './Model';
import TemplateDiffManager from './TemplateDiffManager';
import { getLogger } from './util';
import type { TaskSyncer } from './util';

const log = getLogger(path.basename(__filename, path.extname(__filename)));

export default class ModelDiffManager {
  private readonly model: Model;
  private prompted = false;

  public constructor (model: Model) {
    this.model = model;
  }

  public async process (diffConfig: DiffConfig, syncer: TaskSyncer): Promise<void> {
    log('process', this.model.getName());
    const templates = await this.model.getAllTemplates(syncer)
      .catch(reason => ({ error: reason as unknown }));

    if ('error' in templates) {
      if (syncer.status === 'done') return;
      throw templates.error;
    }

    await Promise.all(templates.map(async template => {
      const ticket = syncer.getTicket(template.getName());
      await new TemplateDiffManager(template, this).process(diffConfig, ticket);
      ticket.close();
    }));
  }

  public async isManageable (diffConfig: DiffConfig, ticket: TaskSyncer): Promise<boolean> {
    if (diffConfig.haveToQuit()) return false;
    if (diffConfig.isModelManageable(this.model.getName())) {
      await ticket.ready;
      this.prompt();
      return true;
    }
    return await this.askManageable(diffConfig, ticket);
  }

  private async askManageable (diffConfig: DiffConfig, ticket: TaskSyncer): Promise<boolean> {
    await ticket.ready;
    const name = this.model.getName();
    const response = await inquirer.prompt({
      /* eslint-disable sort-keys */
      type: 'expand',
      name: 'manage',
      message: `Manage ${name} ?`,
      choices: [
        { key: 'y', name: `[yes]  Manage ${name}`, value: 'yes' },
        { key: 'n', name: '[no]   Skip this model', value: 'no' },
        { key: 'a', name: "[all]  Manage all models (don't ask more)", value: 'all' },
        { key: 'q', name: '[quit] Skip all unmanaged models and quit the diff', value: 'quit' },
      ],
      'default': 2,
      /* eslint-enable sort-keys */
    });

    switch (response.manage as string) {
    case 'quit':
      diffConfig.haveToQuit(true);
      // fallthrough: continue to 'no' case
    case 'no':
      diffConfig.isModelManageable(name, false);
      return false;
    case 'all':
      diffConfig.manageAllModels();
      // fallthrough: continue to 'y' case
    case 'yes':
      diffConfig.isModelManageable(name, true);
      return true;
    default:
      throw new Error(`Unexpected response : "${String(response.manage)}"`);
    }
  }

  private prompt (): void {
    if (this.prompted) return;
    console.info(chalk.cyanBright(this.model.getName()));
    this.prompted = true;
  }
}
