import path from 'path';

import type DiffConfig from './DiffConfig';
import type Model from './Model';
import TemplateDiffManager from './TemplateDiffManager';
import { getLogger, todo } from './util';
import type { TaskSyncer } from './util';

const log = getLogger(path.basename(__filename, path.extname(__filename)));

export default class ModelDiffManager {
  private readonly model: Model;

  public constructor (model: Model) {
    this.model = model;
  }

  public async process (diffConfig: DiffConfig, syncer: TaskSyncer): Promise<void> {
    log('process', this.model.getName());
    const templates = await this.model.getAllTemplates(syncer);

    await Promise.all(templates.map(async template => {
      const ticket = syncer.getTicket(template.getName());
      await new TemplateDiffManager(template, this).process(diffConfig, ticket);
      ticket.close();
    }));
  }

  public async isManageable (diffConfig: DiffConfig, _syncer: TaskSyncer): Promise<boolean> {
    return await Promise.resolve(todo(this, diffConfig) as boolean);
  }
}
