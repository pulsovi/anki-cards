import path from 'path';

import { sortBy } from 'lodash';

import type Model from './Model';
import ModelManager from './ModelManager';
import TemplateDiffManager from './TemplateDiffManager';
import type { DiffConfig } from './types';
import { getLogger, TaskSyncer } from './util';

const debugLog = getLogger(path.basename(__filename, path.extname(__filename)));

export default class ModelDiffManager {
  private readonly root: string;
  private readonly modelManager: ModelManager;

  public constructor (root: string) {
    this.root = root;
    this.modelManager = new ModelManager(root);
  }

  public async processAll (syncer = new TaskSyncer()): Promise<void> {
    debugLog('DiffManager.processAll');
    const models = sortBy(
      await this.modelManager.getModels(),
      model => model.getName().toLowerCase()
    );
    debugLog('DiffManager.processAll', models.length, 'models found');
    const diffConfig: DiffConfig = {
      quit: false,
    };

    await Promise.all(models.map(async model => {
      await this.processModel(model, diffConfig, syncer);
    }));
  }

  public async processModel (
    model: Model,
    diffConfig: DiffConfig,
    syncer: TaskSyncer
  ): Promise<void> {
    debugLog('DiffManager.processModel', model.getName());
    const ticket = syncer.getTicket();
    const templates = await model.getAllTemplates();
    const templateSyncer = new TaskSyncer();

    await ticket.ready;
    await Promise.all(templates.map(async template => {
      await templateSyncer.enqueue(async () => {
        await new TemplateDiffManager(template, this).process(diffConfig);
      });
    }));
    ticket.close();
  }
}
