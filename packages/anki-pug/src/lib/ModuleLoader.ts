import { ImportErrorManager } from './ErrorManager';
import { TaskSyncer } from './util';

export default class ModuleLoader<U> {
  private readonly modulePath: string;
  private readonly moduleName?: string;

  private loadedModule: Promise<U> | null = null;

  public constructor (modulePath: string, moduleName?: string) {
    this.modulePath = modulePath;
    this.moduleName = moduleName;
  }

  public async load (syncer = new TaskSyncer()): Promise<U> {
    if (!this.loadedModule) this.loadedModule = this._load(syncer);
    return await this.loadedModule;
  }

  private async _load (syncer: TaskSyncer): Promise<U> {
    try {
      const modelImport = await import(this.modulePath) as U;
      return modelImport;
    } catch (error) {
      return await syncer.enqueue(async () => await this.loadErrorHandler(error, syncer));
    }
  }

  private async loadErrorHandler (error: unknown, syncer: TaskSyncer): Promise<U> {
    const errorManager = new ImportErrorManager(error);
    const canBeReloaded = await errorManager.manage();

    if (canBeReloaded) return await this._load(syncer);
    throw error;
  }
}
