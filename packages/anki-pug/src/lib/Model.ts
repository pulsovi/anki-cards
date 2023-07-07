import Joi from 'joi';
import type { ValidationResult } from 'joi';

import type ModelItem from './ModelItem';
import type { RawModelItem } from './ModelItem';
import ModuleLoader from './ModuleLoader';
import { config } from './services';
import type { Services } from './services';
import type { ModelModule } from './types';
import { getLogger, TaskSyncer } from './util';

const log = getLogger('Model');

export type ModelServices = Pick<Services, 'ankiConnection' | 'modelItemFactory'>;

/**
 * Represents an Anki note template
 *
 * Including:
 * - The front and back templates of each card
 * - The note type CSS style file
 * - Media files used by templates and CSS
 */
export default class Model {
  public readonly name: string;

  private readonly modulepath: string;
  private readonly services: ModelServices;

  private allModelItems?: ModelItem[];

  public constructor (modulepath: string, name: string, services: ModelServices) {
    this.services = services;
    this.modulepath = modulepath;
    this.name = name;
  }

  private static async formatModule (moduleValue: unknown): Promise<RawModelItem[]> {
    const modelModule = moduleValue as ModelModule;
    const items = await (typeof modelModule === 'function' ? modelModule(config) : modelModule);
    return Array.isArray(items) ? items : [items];
  }

  public async getAllModelItems (syncer = new TaskSyncer()): Promise<ModelItem[]> {
    if (!this.allModelItems) this.allModelItems = await this._getAllModelItems(syncer);
    return this.allModelItems;
  }

  public getName (): string {
    return this.name;
  }

  /**
   * Check that the value provided as parameter corresponds to an Array of
   * ModelItem in Raw and throw an error otherwise
   */
  private validateModule (moduleValue: RawModelItem[]): ValidationResult<RawModelItem[]> {
    const schema = Joi.array().items(this.services.modelItemFactory.getRawConditionalSchema());
    const validation = schema.validate(moduleValue);

    // Returning result with full error object (with call stack) if validate fail
    if (validation.error) {
      try {
        Joi.assert(moduleValue, schema);
      } catch (error) {
        // Add the error stack
        Object.assign(validation, { error });
      }
    }

    return validation;
  }

  private async _getAllModelItems (syncer: TaskSyncer): Promise<ModelItem[]> {
    log('getAllModelItems');
    const moduleLoader = new ModuleLoader<RawModelItem[]>(
      this.modulepath,
      this.name
    );
    const rawModelItems = await moduleLoader.load({
      format: async moduleValue => await Model.formatModule(moduleValue),
      syncer,
      validate: moduleValue => this.validateModule(moduleValue),
    });
    return rawModelItems.map(
      rawModelItem => this.services.modelItemFactory.getModelItem(rawModelItem)
    );
  }
}
