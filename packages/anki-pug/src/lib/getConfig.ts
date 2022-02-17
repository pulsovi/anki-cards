import Joi from 'joi';
import { load } from 'js-yaml';
import rc from 'rc';

import { getPackageName } from './util/getPackageName';

const appName = getPackageName();

export interface AnkiPugConfig {
  ankiProfile?: string;
  configPath: string;
  modelsPath: string;
}

const schema = Joi.object({
  ankiProfile: Joi.string(),
  configPath: Joi.string(),
  modelsPath: Joi.string(),
});

const defaults = {
  configPath: process.cwd(),
  modelsPath: './model',
};

export default function getConfig (
  argv: object | null = null
): AnkiPugConfig {
  const rcResult = rc(appName, defaults, argv, loadYaml);
  const { '--': __, _, config, configs, ...params } = rcResult;
  const { error } = schema.validate(params);

  if (error) throw logError(error, { _, __, configs, params });

  if (config) params.configPath = config;
  return params;
}

function loadYaml (content: string): object {
  return load(content) as object;
}

function logError (error: Error, results: {
  _: unknown;
  __: unknown;
  configs: string[] | undefined;
  params: AnkiPugConfig;
}): Error {
  const { _, __, configs, params } = results;
  let message = 'There is an error in one of your config files, \n';

  if (Array.isArray(configs) && configs.length) {
    message += 'config files found:\n\t- ';
    message += configs.join('\n\t- ');
  } else
    message += `No config file found. Think create file named ".${appName}rc".`;
  message += '\n';

  if ((Array.isArray(__) && __.length) || (Array.isArray(_) && _.length)) {
    message += 'argv:\n';
    if (Array.isArray(__) && __.length)
      message += `\t--: ${__.join(', ')}\n`;
    if (Array.isArray(_) && _.length)
      message += `\t_: ${_.join(', ')}\n`;
  }

  message += 'parsed config :';
  message += JSON.stringify(params, null, 4);
  message += '\n';

  message += error.message;
  error.message = message;
  return error;
}
