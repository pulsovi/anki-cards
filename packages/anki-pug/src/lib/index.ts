import path from 'path';

import getConfig from './getConfig';
import type { AnkiPugConfig } from './getConfig';
import ModelsDiffManager from './ModelsDiffManager';
import { todo } from './util';

Error.stackTraceLimit = 100;

export async function diff (argv: Partial<AnkiPugConfig> | null = null): Promise<void> {
  const config = getConfig(argv);
  const modelsFolder = path.resolve(path.dirname(config.configPath), config.modelsPath);
  const diffManager = new ModelsDiffManager(modelsFolder);

  await diffManager.process();
}

export async function test (argv: Partial<AnkiPugConfig> | null = null): Promise<void> {
  const config = getConfig(argv);
  await todo({ config });
}
