import chalk from 'chalk';

import type ModuleLoader from '../ModuleLoader';
import { chokidarOnce, requireGetChildren, requireUncacheOnly } from '../util';

import type { BaseErrorManager } from './types';

export default class DefaultImportErrorManager<U> implements BaseErrorManager {
  private readonly error: Error;
  private readonly moduleLoader: ModuleLoader<U>;

  public constructor (error: Error, moduleLoader: ModuleLoader<U>) {
    this.error = error;
    this.moduleLoader = moduleLoader;
  }

  public async manage (): Promise<void> {
    const moduleName = this.moduleLoader.getModuleName();
    const modulePath = this.moduleLoader.getModulePath();
    const errorModule = this.getErrorModulePath();
    const moduleTree = (errorModule ? [errorModule, ...requireGetChildren(errorModule)] : [])
      .concat([
        modulePath,
        ...requireGetChildren(modulePath),
      ])
      .filter(filepath => !filepath.includes('\\node_modules\\'));

    console.info(`${chalk.red(this.error.name)}: ${chalk.yellow(this.error.message)}\n${
      moduleTree.reduce((output, file) => output.replace(
        RegExp(file.replace(/\\/gu, '\\\\'), 'gu'), chalk.underline(file)
      ), this.getErrorStackOnly() ?? '')
    }\n  when attempt to load ${
      typeof moduleName === 'string' ?
        `"${chalk.green(moduleName)}"(${chalk.yellow(modulePath)})` :
        chalk.yellow(modulePath)
    }\n  Edit the file or one of its dependancies and save changes for retry.\n  Files watched:\n    ${
      moduleTree.map(file => chalk.cyanBright(file)).join('\n    ')}`);
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
