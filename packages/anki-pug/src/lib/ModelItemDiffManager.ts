import chalk from 'chalk';

import type DiffConfig from './DiffConfig';
import type ModelDiffManager from './ModelDiffManager';
import type ModelItem from './ModelItem';
import ModelItemDiffMenu from './ModelItemDiffMenu';
import type { TaskSyncer } from './util';

export default class ModelItemDiffManager {
  private readonly modelDiffManager: ModelDiffManager;
  private readonly modelItem: ModelItem;

  private prompted = false;

  public constructor (modelItem: ModelItem, modelDiffManager: ModelDiffManager) {
    this.modelDiffManager = modelDiffManager;
    this.modelItem = modelItem;
  }

  public getModelItem (): ModelItem {
    return this.modelItem;
  }

  public async process (diffConfig: DiffConfig, syncer: TaskSyncer): Promise<void> {
    const promptPromise = syncer.enqueue(() => { this.prompt(); }).catch(() => { /* do nothing */ });
    const modelIsManageable = this.modelDiffManager.isManageable(diffConfig);

    if (modelIsManageable) {
      const diffMenu = new ModelItemDiffMenu(this, diffConfig, syncer.getTicket('menu'));
      await diffMenu.process();
    }
    await promptPromise;
  }

  private prompt (): void {
    if (this.prompted) return;
    console.info(chalk.greenBright(`  ${this.modelItem.getName()}`));
    this.prompted = true;
  }
}
