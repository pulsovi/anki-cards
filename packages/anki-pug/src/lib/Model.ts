import ModuleLoader from './ModuleLoader';
import Template from './Template';
import type { ModelModule } from './types';
import { getConfig, getLogger, TaskSyncer, todo } from './util';

const log = getLogger('Model');

export default class Model {
  private readonly modulepath: string;
  private readonly name: string;
  private allTemplates?: Template[];

  public constructor (modulepath: string, name: string) {
    this.modulepath = modulepath;
    this.name = name;
  }

  public async getAllTemplates (syncer = new TaskSyncer()): Promise<Template[]> {
    if (!this.allTemplates) {
      this.allTemplates = await this._getAllTemplates(syncer)
        .catch(async error => await Promise.resolve(todo(error) as Template[]));
    }
    return this.allTemplates;
  }

  public getName (): string {
    return this.name;
  }

  private async _getAllTemplates (syncer: TaskSyncer): Promise<Template[]> {
    log('getAllTemplates');
    const model = await new ModuleLoader<ModelModule>(this.modulepath, this.name).load(syncer);
    const templates = await (typeof model === 'function' ? model(getConfig()) : model);
    return (Array.isArray(templates) ? templates : [templates]).map(raw => new Template(raw, this));
  }
}
