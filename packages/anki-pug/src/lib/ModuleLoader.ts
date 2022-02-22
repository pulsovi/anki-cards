import { TaskSyncer, todo } from './util';

export default class ModuleLoader<U> {
  private readonly modulepath: string;

  private loadedModule: Promise<U> | null = null;

  public constructor (modulepath: string) {
    this.modulepath = modulepath;
  }

  public async load (syncer = new TaskSyncer()): Promise<U> {
    if (!this.loadedModule) this.loadedModule = this._load(syncer);
    return await this.loadedModule;
  }

  private async _load (syncer: TaskSyncer): Promise<U> {
    try {
      const modelImport = await import(this.modulepath) as U;
      return modelImport;
    } catch (error) {
      await syncer.enqueue(async () => { await this.loadErrorHandler(error); });
      return await this._load(syncer);
    }
  }

  private async loadErrorHandler (error: unknown): Promise<void> {
    await Promise.resolve(todo(this, error));
  }
}
