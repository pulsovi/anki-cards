import path from 'path';

import chalk from 'chalk';

import type DiffConfig from './DiffConfig';
import type Model from './Model';
import ModelItemDiffManager from './ModelItemDiffManager';
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
    // prompt model name synchronously, possible error: syncer is done
    syncer.enqueue(() => { this.prompt(); }).catch(() => { /* do nothing */ });

    const modelItems = await this.model.getAllModelItems(syncer)
      .catch(reason => ({ error: reason as unknown }));

    if ('error' in modelItems) {
      if (syncer.status === 'done') return;
      throw modelItems.error;
    }

    await Promise.all(modelItems.map(async modelItem => {
      const ticket = syncer.getTicket(modelItem.getName());
      await new ModelItemDiffManager(modelItem, this).process(diffConfig, ticket);
      ticket.close();
    }));
  }

  public isManageable (diffConfig: DiffConfig): boolean {
    if (diffConfig.haveToQuit()) return false;
    const manageable = diffConfig.isModelManageable(this.model.getName());
    if (typeof manageable === 'boolean') return manageable;
    return true;
  }

  private prompt (): void {
    if (this.prompted) return;
    console.info(`${chalk.yellow('<')}${chalk.cyanBright(this.model.getName())}${chalk.yellow('>')}`);
    this.prompted = true;
  }
}
