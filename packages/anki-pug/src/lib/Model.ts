import type { ValidationResult } from 'joi';

import ModuleLoader from './ModuleLoader';
import Template from './Template';
import type { RawTemplate } from './Template';
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

  private static async formatModule (moduleValue: unknown): Promise<RawTemplate[]> {
    const modelModule = moduleValue as ModelModule;
    const templates = await (
      typeof modelModule === 'function' ?
        modelModule(getConfig()) :
        modelModule
    );
    return Array.isArray(templates) ? templates : [templates];
  }

  public async getAllTemplates (syncer = new TaskSyncer()): Promise<Template[]> {
    if (!this.allTemplates) this.allTemplates = await this._getAllTemplates(syncer);
    return this.allTemplates;
  }

  public getName (): string {
    return this.name;
  }

  private async _getAllTemplates (syncer: TaskSyncer): Promise<Template[]> {
    log('getAllTemplates');
    const moduleLoader = new ModuleLoader<RawTemplate[]>(
      this.modulepath,
      this.name
    );
    const rawTemplates = await moduleLoader.load({
      format: async moduleValue => await Model.formatModule(moduleValue),
      syncer,
      validate: async moduleValue => await this.validateModule(moduleValue),
    });
    return rawTemplates.map(rawTemplate => new Template(rawTemplate, this));
  }

  private async validateModule (moduleValue: ModelModule): Promise<ValidationResult<RawTemplate[]>> {
    return await Promise.resolve(todo(this, moduleValue) as ValidationResult<RawTemplate[]>);
  }
}
