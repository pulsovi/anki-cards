import chalk from 'chalk';
import { ValidationError } from 'joi';

import type ModuleLoader from '../ModuleLoader';
import { chokidarOnce, requireGetChildren, requireUncacheOnly } from '../util';

import type { BaseErrorManager } from './types';
import { formatError, formatFiles, formatModule } from './util';

export default class ValidationErrorManager<U> implements BaseErrorManager {
  private readonly error: ValidationError;
  private readonly moduleLoader: ModuleLoader<U>;

  public constructor (error: Error, moduleLoader: ModuleLoader<U>) {
    if (error instanceof ValidationError) this.error = error;
    else throw new TypeError(`Le type de l'erreur "${error.name}" n'est pas pris en charge.`);
    this.moduleLoader = moduleLoader;
  }

  public async manage (): Promise<void> {
    const modulePath = this.moduleLoader.getModulePath();
    const moduleTree = [
      modulePath,
      ...requireGetChildren(modulePath),
    ].filter(filepath => !filepath.includes('\\node_modules\\'));

    console.info(`${formatError(this.error)}\n${formatModule(this.moduleLoader)}\n  ${
      chalk.green('Edit the file or one of its dependancies and save changes for retry.')
    }\n${formatFiles(moduleTree)}`);
    await chokidarOnce('change', moduleTree);
    requireUncacheOnly(moduleTree);
  }
}
