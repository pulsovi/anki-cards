import 'core-js/actual/aggregate-error';

import type ModuleLoader from '../ModuleLoader';

import DefaultImportErrorManager from './DefaultImportErrorManager';
import ModuleNotFoundErrorManager from './ModuleNotFoundErrorManager';
import type { BaseErrorManager, ErrorWithCode } from './types';

export default class ImportErrorManager<U> implements BaseErrorManager {
  private readonly moduleLoader: ModuleLoader<U>;
  private readonly specificManager: BaseErrorManager;

  public constructor (error: unknown, moduleLoader: ModuleLoader<U>) {
    this.moduleLoader = moduleLoader;
    if (!(error instanceof Error)) {
      throw new AggregateError([
        new TypeError('Only errors which are instance of Error can be handled.'),
        error,
      ], 'Unable to manage this error');
    }
    if ((error as ErrorWithCode).code === 'MODULE_NOT_FOUND') {
      this.specificManager = new ModuleNotFoundErrorManager(
        error as ErrorWithCode, this.moduleLoader
      );
    } else
      this.specificManager = new DefaultImportErrorManager(error, this.moduleLoader);
  }

  public async manage (): Promise<void> {
    await this.specificManager.manage();
  }
}
