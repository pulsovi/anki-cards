import Joi from 'joi';

import type ModelItem from './ModelItem';
import { rawModelItemSchema } from './ModelItem';
import type { ModelItemConcrete, RawModelItem } from './ModelItem';
import type { AnkiConnect, Services } from './services';

type ModelItemFactoryServices = Pick<Services, 'ankiConnection'>;

/** Manages the different variations of ModelItem - Template, CssStyleSheet, Media */
export default class ModelItemFactory {
  public readonly ankiConnection: AnkiConnect;

  /** Registered ModelItem types */
  private readonly knownItemTypes: Record<string, ModelItemConcrete> = {};

  public constructor (services: ModelItemFactoryServices) {
    this.ankiConnection = services.ankiConnection;
  }

  /**
   * Instantiates and returns the correct ModelItem declination corresponding
   * to the RawModelItem object provided
   *
   * @param raw The RawModelItem object that should be mapped to a ModelItem instance
   */
  public getModelItem (raw: RawModelItem): ModelItem {
    if (raw.type in this.knownItemTypes) return new this.knownItemTypes[raw.type](raw, this);
    const allowedTypes = Object.keys(this.knownItemTypes).map(type => `"${type}"`).join(', ');
    throw new TypeError(`Unknown model item type : ${raw.type}. Allowed types are ${allowedTypes}.`);
  }

  /** Return a list of all valid schemas for Raw model items registered */
  public getRawSchemas (): Joi.AnySchema[] {
    return Object.values(this.knownItemTypes).map(modelItemClass => modelItemClass.RAW_SCHEMA);
  }

  /** Return a conditional schema for Raw model items registered */
  public getRawConditionalSchema (): Joi.AnySchema {
    const itemTypes = Object.values(this.knownItemTypes);
    const cases = itemTypes.map<Joi.SwitchCases & Partial<Joi.SwitchDefault>>(
      modelItemClass => ({ is: modelItemClass.TYPE, then: modelItemClass.RAW_SCHEMA })
    );

    cases[cases.length - 1].otherwise = rawModelItemSchema;
    return Joi.alternatives().conditional('type', { 'switch': cases }).required();
  }

  /**
   * Add a new ModelItem variation to the variations known by this factory
   *
   * @param variation A class that extends ModelItem
   */
  public registerModelItemVariation (variation: ModelItemConcrete): void {
    if (variation.TYPE in this.knownItemTypes)
      throw new Error(`Duplicate registration error : There is a ModelItem class with the "${variation.TYPE}" type already registered in this factory.`);
    this.knownItemTypes[variation.TYPE] = variation;
  }
}
