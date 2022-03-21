import path from 'path';

import chalk from 'chalk';
import 'core-js/actual/aggregate-error';
import Joi from 'joi';
import pkgDir from 'pkg-dir';

import type ModuleLoader from '../ModuleLoader';
import { chokidarOnce } from '../util';

import type { ErrorWithCode, BaseErrorManager } from './types';
import { formatFiles, formatModule } from './util';

export interface ModuleNotFoundError extends ErrorWithCode {
  code: 'MODULE_NOT_FOUND';
  requireStack: string[];
}

const moduleNotFoundErrorMessageRE = /^Cannot find module '(?<missingFile>[^\n]*)'\n/u;
const moduleNotFoundErrorSchema = Joi.object({
  code: 'MODULE_NOT_FOUND',
  message: Joi.string().pattern(moduleNotFoundErrorMessageRE).required(),
  requireStack: Joi.array().items(Joi.string()).required(),
});

export default class ModuleNotFoundErrorManager<U> implements BaseErrorManager {
  private readonly error: ModuleNotFoundError;
  private readonly moduleLoader: ModuleLoader<U>;
  private readonly missingFile: string;

  public constructor (error: ErrorWithCode, moduleLoader: ModuleLoader<U>) {
    this.error = ModuleNotFoundErrorManager.formatError(error);
    this.moduleLoader = moduleLoader;
    this.missingFile = this.getMissingFile();
  }

  private static formatError (error: ErrorWithCode): ModuleNotFoundError {
    const validation = moduleNotFoundErrorSchema.validate({ ...error, message: error.message });
    if (validation.error)
      throw new AggregateError([validation.error, error], 'Unable to manage this error');
    return error as ModuleNotFoundError;
  }

  public async manage (): Promise<void> {
    const me = await pkgDir(__filename) ?? __dirname;
    const requireStack = this.error.requireStack.filter(modulePath => !modulePath.startsWith(me));
    const files = [
      this.missingFile,
      ...requireStack,
    ];

    console.info(`${chalk.red('Missing file')} : ${chalk.yellow(this.missingFile)}\n${
      formatModule(this.moduleLoader)}\n  ${
      chalk.green('Edit and save one of these files to retry.')
    }\n${formatFiles(files)}`);
    await chokidarOnce(['change', 'add'], files);
  }

  private getMissingFile (): string {
    const file = moduleNotFoundErrorMessageRE.exec(this.error.message)?.groups?.missingFile;
    const { requireStack } = this.error;
    const [relativeTo] = requireStack;

    if (!file) throw new AggregateError([this.error], 'Missing file name cannot be empty');
    return path.resolve(relativeTo, file);
  }
}
