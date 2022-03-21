import path from 'path';

import getConfig from './getConfig';
import type { AnkiPugConfig } from './getConfig';
import ModelsDiffManager from './ModelsDiffManager';

Error.stackTraceLimit = 100;

// eslint-disable-next-line import/prefer-default-export
export async function diff (argv: Partial<AnkiPugConfig> | null = null): Promise<void> {
  const config = getConfig(argv);
  const modelsFolder = path.resolve(path.dirname(config.configPath), config.modelsPath);
  const diffManager = new ModelsDiffManager(modelsFolder);

  await diffManager.process();
}
