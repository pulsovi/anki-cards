import type { Schema } from 'joi';

import { ImportErrorManager, ValidationErrorManager } from './ErrorManager';
import { TaskSyncer } from './util';

export default class ModuleLoader<U> {
  private readonly modulePath: string;
  private readonly moduleName?: string;
  private readonly schema?: Schema;

  private loadedModule: Promise<U> | null = null;

  public constructor (
    modulePath: string,
    moduleName?: string,
    schema?: Schema
  ) {
    this.modulePath = modulePath;
    this.moduleName = moduleName;
    this.schema = schema;
  }

  public async load (syncer = new TaskSyncer()): Promise<U> {
    if (!this.loadedModule) this.loadedModule = this._load(syncer);
    return await this.loadedModule;
  }

  private async _load (syncer: TaskSyncer): Promise<U> {
    const value = await import(this.modulePath).catch(async error => await syncer.enqueue(
      async () => await this.importErrorHandler(error, syncer)
    )) as U;
    if (this.schema) {
      const validation = this.schema.validate(value);
      if (validation.error) {
        return await syncer.enqueue(
          async () => await this.validationErrorHandler(validation.error, syncer)
        );
      }
    }
    return value;
  }

  private async importErrorHandler (error: unknown, syncer: TaskSyncer): Promise<U> {
    const errorManager = new ImportErrorManager(error as Error);
    const canBeReloaded = await errorManager.manage();

    if (canBeReloaded) return await this._load(syncer);
    throw error;
  }

  private async validationErrorHandler (error: unknown, syncer: TaskSyncer): Promise<U> {
    const errorManager = new ValidationErrorManager(error as Error);
    const canBeReloaded = await errorManager.manage();

    if (canBeReloaded) return await this._load(syncer);
    throw error;
  }
}
