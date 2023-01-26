import path from 'path';

import Joi from 'joi';
import { load } from 'js-yaml';
import rc from 'rc';

import { jsonClone } from './util';

const appName = 'ankipug';

export interface AnkiPugConfig {
  ankiProfile: string;
  configPath: string;
  testsPath?: string;
  modelsPath: string;
}

const schema = Joi.object({
  ankiProfile: Joi.string().required(),
  configPath: Joi.string(),
  modelsPath: Joi.string().required(),
  testsPath: Joi.string(),
});

const defaults = {};

function defaultMap (config: Partial<AnkiPugConfig>): AnkiPugConfig {
  const retVal = { ...config } as AnkiPugConfig;
  if ('modelsPath' in retVal) {
    if ('configPath' in retVal)
      retVal.modelsPath = path.resolve(path.dirname(retVal.configPath), retVal.modelsPath);
    else retVal.modelsPath = path.resolve(retVal.modelsPath);
    if (!('testsPath' in retVal)) retVal.testsPath = path.join(retVal.modelsPath, '../tests');
  }
  return retVal;
}

class ValidationError extends Error {
  public constructor (error: Error, results: {
    _: unknown;
    __: unknown;
    argv: unknown;
    configs: string[] | undefined;
    parsed: AnkiPugConfig;
  }) {
    const { _, __, configs, parsed } = results;
    let message = 'There is an error in one of your config files, \n';

    if (Array.isArray(configs) && configs.length) {
      message += 'config files found:\n  - ';
      message += configs.join('\n  - ');
    } else
      message += `No config file found. Think create file named ".${appName}rc".`;
    message += '\n';

    if ((Array.isArray(__) && __.length) || (Array.isArray(_) && _.length)) {
      message += 'argv:\n';
      if (Array.isArray(__) && __.length)
        message += `  --: ${__.join(', ')}\n`;
      if (Array.isArray(_) && _.length)
        message += `  _: ${_.join(', ')}\n`;
    }

    message += 'parsed config :';
    message += JSON.stringify(parsed, null, 2);
    message += `\nerror message: ${error.message}`;
    console.info(message, { argv: results.argv, 'process.argv': process.argv });

    super(error.message);
    this.name = 'ValidationError';
  }
}

export default function getConfig (
  argv: object | null = null
): AnkiPugConfig {
  const rcResult = rc(appName, jsonClone(defaults), argv, loadYaml);
  const { '--': __, _, config, configs, ...params } = rcResult;

  if (config) params.configPath = config;
  const parsed = defaultMap(params);
  const { error } = schema.validate(params);

  if (error) throw new ValidationError(error, { _, __, argv, configs, parsed });

  return parsed;
}

function loadYaml (content: string): object {
  return load(content) as object;
}
