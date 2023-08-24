import path from 'path';

import Joi from 'joi';

import getConfig from '../lib/getConfig';
import TestManager from '../lib/TestManager';

export interface AnkiPugTestConfig {
  configPath?: string;

  /**
   * The folder in which to put or search the test files
   * default: `'./tests'`
   */
  testsFolder: string;
}

const schema: Joi.Schema<AnkiPugTestConfig> = Joi.object({
  configPath: Joi.string().optional(),
  testsFolder: Joi.string().required(),
});

export async function test (argv: Partial<AnkiPugTestConfig> | null = null): Promise<void> {
  const config = getConfig<AnkiPugTestConfig>(argv, schema, (raw: Partial<AnkiPugTestConfig>) => {
    if (raw.configPath) {
      if (raw.testsFolder) raw.testsFolder = path.resolve(raw.configPath, raw.testsFolder);
      else raw.testsFolder = path.resolve(raw.configPath, './tests');
    }
    return raw;
  });
  const testManager = new TestManager(config);
  await testManager.process();
}
