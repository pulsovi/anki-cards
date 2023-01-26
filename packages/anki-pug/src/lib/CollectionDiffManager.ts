import path from 'path';

import { sortBy } from 'lodash';

import DiffConfig from './DiffConfig';
import ModelCollectionManager from './ModelCollectionManager';
import type { ModelCollectionManagerServices } from './ModelCollectionManager';
import ModelDiffManager from './ModelDiffManager';
import { getLogger, TaskSyncer } from './util';

const log = getLogger(path.basename(__filename, path.extname(__filename)));

type CollectionDiffManagerServices = ModelCollectionManagerServices;

/**
 * Synchronizes a collection of Anki note types between the Pug files format and
 * the anki-connect API
 */
export default class CollectionDiffManager {
  private readonly root: string;
  private readonly modelCollectionManager: ModelCollectionManager;

  public constructor (root: string, services: CollectionDiffManagerServices) {
    this.root = root;
    this.modelCollectionManager = new ModelCollectionManager(root, services);
  }

  public async process (syncer = new TaskSyncer('CollectionDiffManager@process')): Promise<void> {
    log('process');
    const models = sortBy(
      await this.modelCollectionManager.getModels(),
      model => model.getName().toLowerCase()
    );
    log('process', models.length, 'models found');
    const diffConfig = new DiffConfig(syncer);

    await Promise.all(models.map(async model => {
      const ticket = syncer.getTicket(model.getName());
      const modelDiffManager = new ModelDiffManager(model);

      await modelDiffManager.process(diffConfig, ticket);
      ticket.close();
    }));
  }
}
