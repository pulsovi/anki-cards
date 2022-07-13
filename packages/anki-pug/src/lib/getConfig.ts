import Joi from 'joi';
import { load } from 'js-yaml';
import rc from 'rc';

const appName = 'ankipug';

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

class ValidationError extends Error {
  public constructor (error: Error, results: {
    _: unknown;
    __: unknown;
    configs: string[] | undefined;
    params: AnkiPugConfig;
  }) {
    const { _, __, configs, params } = results;
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
        message += `\t--: ${__.join(', ')}\n`;
      if (Array.isArray(_) && _.length)
        message += `\t_: ${_.join(', ')}\n`;
    }

    message += 'parsed config :';
    message += JSON.stringify(params, null, 2);
    console.info(message);

    super(error.message);
    this.name = 'ValidationError';
  }
}

export default function getConfig (
  argv: object | null = null
): AnkiPugConfig {
  const rcResult = rc(appName, defaults, argv, loadYaml);
  const { '--': __, _, config, configs, ...params } = rcResult;
  const { error } = schema.validate(params);

  if (error) throw new ValidationError(error, { _, __, configs, params });

  if (config) params.configPath = config;
  return params;
}

function loadYaml (content: string): object {
  return load(content) as object;
}
