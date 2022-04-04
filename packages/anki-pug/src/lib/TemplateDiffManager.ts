import chalk from 'chalk';

import type DiffConfig from './DiffConfig';
import type ModelDiffManager from './ModelDiffManager';
import type Template from './Template';
import TemplateDiffMenu from './TemplateDiffMenu';
import type { TaskSyncer } from './util';

export default class TemplateDiffManager {
  private readonly modelDiffManager: ModelDiffManager;
  private readonly template: Template;

  private prompted = false;

  public constructor (template: Template, modelDiffManager: ModelDiffManager) {
    this.modelDiffManager = modelDiffManager;
    this.template = template;
  }

  public getTemplate (): Template {
    return this.template;
  }

  public async process (diffConfig: DiffConfig, syncer: TaskSyncer): Promise<void> {
    syncer.enqueue(() => { this.prompt(); }).catch(() => { /* do nothing */ });
    const modelIsManageable = this.modelDiffManager.isManageable(diffConfig);
    if (!modelIsManageable) return;

    const diffMenu = new TemplateDiffMenu(this, diffConfig, syncer.getTicket('menu'));
    await diffMenu.process();
  }

  public prompt (): void {
    if (this.prompted) return;
    console.info(chalk.greenBright(`  ${this.template.getName()}`));
    this.prompted = true;
  }
}
