import type { ValidationResult } from 'joi';

import { ImportErrorManager, ValidationErrorManager } from './ErrorManager';
import type { SyncOrPromise } from './types';
import { TaskSyncer } from './util';

interface LoadOptions<T> {
  format?: (value: unknown) => SyncOrPromise<T>;
  syncer?: TaskSyncer;
  validate?: (value: T) => SyncOrPromise<ValidationResult<T>>;
}

export default class ModuleLoader<U> {
  private readonly modulePath: string;
  private readonly moduleName?: string;

  private loadedModule: Promise<U> | null = null;

  public constructor (
    modulePath: string,
    moduleName?: string
  ) {
    this.modulePath = modulePath;
    this.moduleName = moduleName;
  }

  public async load (options: LoadOptions<U>): Promise<U> {
    if (!this.loadedModule) this.loadedModule = this._load(options);
    return await this.loadedModule;
  }

  private async _load (options: LoadOptions<U>): Promise<U> {
    const { format, syncer = new TaskSyncer(), validate } = options;
    const value = (await import(this.modulePath).catch(async error => await syncer.enqueue(
      async () => await this.importErrorHandler(error, { ...options, syncer })
    )) as { default: U }).default;
    const formatedValue = format ? await format(value) : value;

    if (validate) {
      const validationResult = await validate(formatedValue);
      if (validationResult.error) {
        return await syncer.enqueue(
          async () => await this.validationErrorHandler(
            validationResult.error,
            { ...options, syncer }
          )
        );
      }
      return validationResult.value;
    }

    return formatedValue;
  }

  private async importErrorHandler (error: unknown, loadOptions: LoadOptions<U>): Promise<U> {
    const errorManager = new ImportErrorManager(error as Error);
    const canBeReloaded = await errorManager.manage();

    if (canBeReloaded) return await this._load(loadOptions);
    throw error;
  }

  private async validationErrorHandler (error: unknown, loadOptions: LoadOptions<U>): Promise<U> {
    const errorManager = new ValidationErrorManager(error as Error);
    const canBeReloaded = await errorManager.manage();

    if (canBeReloaded) return await this._load(loadOptions);
    throw error;
  }
}
