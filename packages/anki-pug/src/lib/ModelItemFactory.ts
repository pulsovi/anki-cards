import type Joi from 'joi';

import type ModelItem from './ModelItem';
import type { ModelItemConcrete, RawModelItem } from './ModelItem';

/** Manages the different variations of ModelItem - Template, CssStyleSheet, Media */
export default class ModelItemFactory {
  /** Registered ModelItem types */
  private readonly knownItemTypes: Record<string, ModelItemConcrete> = {};

  /**
   * Instantiates and returns the correct ModelItem declination corresponding
   * to the RawModelItem object provided
   *
   * @param raw The RawModelItem object that should be mapped to a ModelItem instance
   */
  public getModelItem (raw: RawModelItem): ModelItem {
    if (raw.type in this.knownItemTypes) return new this.knownItemTypes[raw.type](raw);
    const allowedTypes = Object.keys(this.knownItemTypes).map(type => `"${type}"`).join(', ');
    throw new TypeError(`Unknown model item type : ${raw.type}. Allowed types are ${allowedTypes}.`);
  }

  /** Return a list of all valid schemas for Raw model items registered */
  public getRawSchemas (): Joi.AnySchema[] {
    return Object.values(this.knownItemTypes).map(modelItemClass => modelItemClass.RAW_SCHEMA);
  }

  /**
   * Add a new ModelItem variation to the variations known by this factory
   *
   * @param variation A class that extends ModelItem
   */
  public registerModelItemVariation (variation: ModelItemConcrete): void {
    if (variation.TYPE in this.knownItemTypes)
      throw new Error(`Duplicate registration error : There is a ModelItem class with the "${variation.TYPE}" already registered in this factory.`);
    this.knownItemTypes[variation.TYPE] = variation;
  }
}
