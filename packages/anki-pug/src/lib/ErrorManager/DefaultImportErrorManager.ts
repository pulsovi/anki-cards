import chalk from 'chalk';

import type ModuleLoader from '../ModuleLoader';
import { chokidarOnce, requireGetChildren, requireUncacheOnly } from '../util';

import type { BaseErrorManager } from './types';
import { formatError, formatFiles, formatModule } from './util';

export default class DefaultImportErrorManager<U> implements BaseErrorManager {
  private readonly error: Error;
  private readonly moduleLoader: ModuleLoader<U>;

  public constructor (error: Error, moduleLoader: ModuleLoader<U>) {
    this.error = error;
    this.moduleLoader = moduleLoader;
  }

  public async manage (): Promise<void> {
    const modulePath = this.moduleLoader.getModulePath();
    const errorModule = this.getErrorModulePath();
    const moduleTree = (errorModule ? [errorModule, ...requireGetChildren(errorModule)] : [])
      .concat([
        modulePath,
        ...requireGetChildren(modulePath),
      ])
      .filter(filepath => !filepath.includes('\\node_modules\\'));

    console.info(`${formatError(this.error)}\n${
      moduleTree.reduce((output, file) => output.replace(
        RegExp(file.replace(/\\/gu, '\\\\'), 'gu'), chalk.underline(file)
      ), this.getErrorStackOnly() ?? '')
    }\n${formatModule(this.moduleLoader)}\n  ${
      chalk.green('Edit the file or one of its dependancies and save changes for retry.')
    }\n${formatFiles(moduleTree)}`);
    await chokidarOnce('change', moduleTree);
    requireUncacheOnly(moduleTree);
  }

  private getErrorModulePath (): string | null {
    const stackLineRE = /^\s+at (?<filepath>.*):\d+:\d+$/u;
    return this.getErrorStackOnly()?.split('\n')
      .find(line => stackLineRE.test(line))
      ?.match(stackLineRE)?.groups?.filepath ?? null;
  }

  private getErrorStackOnly (): string | null {
    return this.error.stack?.split('\n').slice(1).join('\n') ?? null;
  }
}
