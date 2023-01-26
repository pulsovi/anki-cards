import path from 'path';

import CollectionDiffManager from './CollectionDiffManager';
import getConfig from './getConfig';
import type { AnkiPugConfig } from './getConfig';
import * as services from './services';
import { log, todo } from './util';

Error.stackTraceLimit = 100;

export async function diff (argv: Partial<AnkiPugConfig> | null = null): Promise<void> {
  const config = getConfig(argv);
  const modelsFolder = path.resolve(path.dirname(config.configPath), config.modelsPath);

  log({ config, modelsFolder });
  const diffManager = new CollectionDiffManager(modelsFolder, services);

  await diffManager.process();
}

export async function test (argv: Partial<AnkiPugConfig> | null = null): Promise<void> {
  const config = getConfig(argv);
  await todo({ config });
}
