import path from 'path';

import { sortBy } from 'lodash';

import ModelDiffManager from './ModelDiffManager';
import ModelManager from './ModelManager';
import type { DiffConfig } from './types';
import { getLogger, TaskSyncer } from './util';

const debugLog = getLogger(path.basename(__filename, path.extname(__filename)));

export default class ModelsDiffManager {
  private readonly root: string;
  private readonly modelManager: ModelManager;

  public constructor (root: string) {
    this.root = root;
    this.modelManager = new ModelManager(root);
  }

  public async process (syncer = new TaskSyncer('ModelsDiffManager@process')): Promise<void> {
    debugLog('process');
    const models = sortBy(
      await this.modelManager.getModels(),
      model => model.getName().toLowerCase()
    );
    debugLog('process', models.length, 'models found');
    const diffConfig: DiffConfig = {
      quit: false,
    };

    await Promise.all(models.map(async model => {
      const ticket = syncer.getTicket(model.getName());
      const modelDiffManager = new ModelDiffManager(model);

      await modelDiffManager.process(diffConfig, ticket);
      ticket.close();
    }));
  }
}
