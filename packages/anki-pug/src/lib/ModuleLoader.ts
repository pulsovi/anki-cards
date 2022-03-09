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

  public getModulePath (): string {
    return this.modulePath;
  }

  public getModuleName (): string | undefined {
    return this.moduleName;
  }

  public async load (options: LoadOptions<U>): Promise<U> {
    if (!this.loadedModule) this.loadedModule = this._load(options);
    return await this.loadedModule;
  }

  private async _load (options: LoadOptions<U>): Promise<U> {
    const { format, syncer = new TaskSyncer(), validate } = options;
    const imported = await import(this.modulePath).then(
      (value: { default: unknown }) => ({ value: value.default }),
      (error: unknown) => ({ error })
    );

    if ('error' in imported) {
      await syncer.enqueue(
        async () => { await this.importErrorHandler(imported.error); },
        'ImportError'
      );
      return await this._load(options);
    }

    const formatedValue = format ? await format(imported.value) : imported.value as U;

    if (validate) {
      const validationResult = await validate(formatedValue);
      if (validationResult.error) {
        await syncer.enqueue(
          async () => { await this.validationErrorHandler(validationResult.error); },
          'ValidationError'
        );
        return await this._load(options);
      }
      return validationResult.value;
    }

    return formatedValue;
  }

  private async importErrorHandler (error: unknown): Promise<void> {
    const errorManager = new ImportErrorManager(error as Error, this);
    await errorManager.manage();
  }

  private async validationErrorHandler (error: unknown): Promise<void> {
    const errorManager = new ValidationErrorManager(error as Error, this);
    await errorManager.manage();
  }
}
