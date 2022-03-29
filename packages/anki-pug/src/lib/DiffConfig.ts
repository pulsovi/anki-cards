import { isUndefined } from 'lodash';

export default class DiffConfig {
  private manageableModels: Record<string, boolean> = {};
  private _manageAllModels = false;

  private quit = false;

  public haveToQuit (): boolean;
  public haveToQuit (value: boolean): this;
  public haveToQuit (value?: boolean): boolean | this {
    if (isUndefined(value)) return this.quit;
    this.quit = value;
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
