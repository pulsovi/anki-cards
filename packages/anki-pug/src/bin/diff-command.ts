import path from 'path';

import Joi from 'joi';

import CollectionDiffManager from '../lib/CollectionDiffManager';
import getConfig from '../lib/getConfig';
import * as services from '../lib/services';
import { log } from '../lib/util';

export interface AnkiPugConfig {
  ankiProfile: string;
  configPath: string;
  modelsPath: string;
}

const schema = Joi.object<AnkiPugConfig>({
  ankiProfile: Joi.string().required(),
  configPath: Joi.string(),
  modelsPath: Joi.string().required(),
}).unknown(true);

/** Check differences between Anki and pug models templates */
export async function diff (argv: Partial<AnkiPugConfig> | null = null): Promise<void> {
  const config = getConfig(argv, schema, (raw: Partial<AnkiPugConfig>) => {
    if ('modelsPath' in raw && raw.modelsPath) {
      if ('configPath' in raw && raw.configPath)
        raw.modelsPath = path.resolve(path.dirname(raw.configPath), raw.modelsPath);
      else raw.modelsPath = path.resolve(raw.modelsPath);
    }
    else raw.modelsPath = path.resolve(raw.configPath ? raw.configPath : process.cwd(), './models');
    return raw;
  });
  const modelsFolder = path.resolve(path.dirname(config.configPath), config.modelsPath);

  log({ config, modelsFolder });
  const diffManager = new CollectionDiffManager(modelsFolder, services);

  await diffManager.process();
}

export { schema as ankiPugConfigSchema };
