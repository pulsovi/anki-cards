import Template from './Template';
import type { ModelModule } from './types';
import { getConfig, getLogger } from './util';

const log = getLogger('Model');

export default class Model {
  private readonly modulepath: string;
  private readonly name: string;
  private allTemplates?: Template[];

  public constructor (modulepath: string, name: string) {
    this.modulepath = modulepath;
    this.name = name;
  }

  public async getAllTemplates (): Promise<Template[]> {
    if (!this.allTemplates) this.allTemplates = await this._getAllTemplates();
    return this.allTemplates;
  }

  public getName (): string {
    return this.name;
  }

  private async _getAllTemplates (): Promise<Template[]> {
    log('getAllTemplates');
    const model = await import(this.modulepath) as ModelModule;
    const templates = await (typeof model === 'function' ? model(getConfig()) : model);
    return (Array.isArray(templates) ? templates : [templates]).map(raw => new Template(raw, this));
  }
}
