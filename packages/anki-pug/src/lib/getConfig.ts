import type Joi from 'joi';
import { load } from 'js-yaml';
import rc from 'rc';

import { jsonClone } from './util';

const appName = 'ankipug';

class ValidationError extends Error {
  public constructor (error: Error, results: {
    _: unknown;
    __: unknown;
    argv: unknown;
    configs: string[] | undefined;
    parsed: object;
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

function getConfig<T> (argv: object | null, schema: Joi.AnySchema<T>, defaults?: object | ((raw: object) => object)): T;
function getConfig<T> (argv: T): T;
function getConfig (argv?: object | null): object;
function getConfig<T> (
  argv: object | null = null,
  schema?: Joi.AnySchema<T>,
  defaults?: object | ((raw: object) => object)
): T | object {
  const rcResult = rc(appName, jsonClone(defaults, true), argv, loadYaml);
  const { '--': __, _, config, configs, ...rawResult } = rcResult;

  // add configPath
  if (config) rawResult.configPath = config;

  // add defaults
  let fullResult: object = rawResult;
  if (defaults) {
    if (typeof defaults !== 'object') fullResult = defaults(fullResult);
    fullResult = { ...defaults, ...fullResult };
  }

  if (!schema) return fullResult;
  const { error, value } = schema.validate(fullResult);
  if (error) throw new ValidationError(error, { _, __, argv, configs, parsed: fullResult });
  return value;
}
export default getConfig;

function loadYaml (content: string): object {
  return load(content) as object;
}
