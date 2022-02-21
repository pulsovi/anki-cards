import path from 'path';

import { sortBy } from 'lodash';

import Model from './Model';
import ModelManager from './ModelManager';
import type { DiffConfig } from './types';
import { getLogger, TaskSyncer, todo } from './util';

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
    await Promise.resolve(todo(this, model, diffConfig, syncer, Model));
  }
}
