import type Joi from 'joi';

import type ModelItem from './ModelItem';
import type { RawModelItem } from './ModelItem';
import { todo } from './util';

/** Manages the different variations of ModelItem */
export default class ModelItemFactory {
  /** All valid schemas for Raw objects */
  public readonly rawSchemas: Joi.AnySchema[] = [];

  /**
   * Instantiates and returns the correct ModelItem declination corresponding
   * to the RawModelItem object provided
   *
   * @param raw The RawModelItem object that should be mapped to a ModelItem instance
   */
  public getModelItem (raw: RawModelItem): ModelItem {
    return todo(raw, this) as ModelItem;
  }

  /**
   * Add a new ModelItem variation to the variations known by this factory
   *
   * @param variation A class that extends ModelItem
   */
  private registerModelItemVariation (variation: typeof ModelItem): void {
    todo(variation, this);
  }
}
