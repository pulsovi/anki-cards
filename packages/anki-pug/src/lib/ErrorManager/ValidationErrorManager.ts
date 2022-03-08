import chalk from 'chalk';
import { ValidationError } from 'joi';

import type ModuleLoader from '../ModuleLoader';
import { chokidarOnce } from '../util';

import type { BaseErrorManager } from './types';

export default class ValidationErrorManager<U> implements BaseErrorManager {
  private readonly error: ValidationError;
  private readonly moduleLoader: ModuleLoader<U>;

  public constructor (error: Error, moduleLoader: ModuleLoader<U>) {
    if (error instanceof ValidationError) this.error = error;
    else throw new TypeError(`Le type de l'erreur "${error.name}" n'est pas pris en charge.`);
    this.moduleLoader = moduleLoader;
  }

  public async manage (): Promise<void> {
    const moduleName = this.moduleLoader.getModuleName();
    const modulePath = this.moduleLoader.getModulePath();

    console.info(`${chalk.red('ValidationError')}: ${this.error.message}\n  when attempt to load ${
      typeof moduleName === 'string' ?
        `"${moduleName}"(${chalk.yellow(modulePath)})` :
        chalk.yellow(modulePath)
    }\n  Edit the file and save changes for retry.`);
    await chokidarOnce('change', this.moduleLoader.getModulePath());
  }
}
