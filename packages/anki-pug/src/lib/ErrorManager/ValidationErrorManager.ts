import chalk from 'chalk';
import { ValidationError } from 'joi';

import type ModuleLoader from '../ModuleLoader';
import { chokidarOnce, requireGetChildren, requireUncacheOnly } from '../util';

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
    const moduleTree = [
      modulePath,
      ...requireGetChildren(modulePath),
    ].filter(filepath => !filepath.includes('\\node_modules\\'));

    console.info(`${chalk.red('ValidationError')}: ${this.error.message}\n  when attempt to load ${
      typeof moduleName === 'string' ?
        `"${moduleName}"(${chalk.yellow(modulePath)})` :
        chalk.yellow(modulePath)
    }\n  Edit the file or one of its dependancies and save changes for retry.\n  Files watched: [\n    ${
      moduleTree.join('\n    ')}\n  ].`);
    await chokidarOnce('change', moduleTree);
    requireUncacheOnly(moduleTree);
  }
}
