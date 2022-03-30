import { isUndefined } from 'lodash';

import type { TaskSyncer } from './util';

export default class DiffConfig {
  private readonly syncer: TaskSyncer;

  private _manageAllModels = false;
  private manageableModels: Record<string, boolean> = {};
  private quit = false;

  public constructor (syncer: TaskSyncer) {
    this.syncer = syncer;
  }

  public haveToQuit (): boolean;
  public haveToQuit (value: boolean): this;
  public haveToQuit (value?: boolean): boolean | this {
    if (isUndefined(value)) return this.quit;
    this.quit = value;
    if (value) this.syncer.close();
    return this;
  }

  public isModelManageable (modelName: string): boolean;
  public isModelManageable (modelName: string, value: boolean): this;
  public isModelManageable (modelName: string, value?: boolean): boolean | this {
    if (isUndefined(value))
      return this._manageAllModels || this.manageableModels[modelName] || false;
    this.manageableModels[modelName] = value;
    return this;
  }

  public manageAllModels (): this {
    this._manageAllModels = true;
    return this;
  }
}
