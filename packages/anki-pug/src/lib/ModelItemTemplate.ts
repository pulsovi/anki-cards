import Joi from 'joi';

import ModelItem, { rawModelItemSchema } from './ModelItem';
import type { ModelItemOptions, RawModelItem } from './ModelItem';
import { todo } from './util/todo';

interface RawModelItemTemplate extends RawModelItem {

  /** path of the template pug source file */
  src: string;

  /** content type of the file */
  contentType?: 'text';

  /** Name of the model containing this template */
  model: string;

  /** Name of the card to which this template belongs */
  card: string;

  /** Face of the card */
  face: 'Back' | 'Front';
}
const rawModelItemTemplateSchema: Joi.Schema<RawModelItemTemplate> = rawModelItemSchema.append({
  card: Joi.string().required(),
  contentType: Joi.valid('text').optional(),
  face: Joi.valid('Back', 'Front').required(),
  model: Joi.string().required(),
  type: Joi.valid('template').required(),
});

export default class ModelItemTemplate extends ModelItem<string> {
  public static readonly TYPE = 'template';
  public static readonly RAW_SCHEMA = rawModelItemTemplateSchema;

  public readonly name: string;
  public readonly src: string;
  public readonly contentType = 'text';
  public readonly model: string;
  public readonly card: string;
  public readonly face: 'Back' | 'Front';

  /**
   * @param raw Must be RawModelItemTemplate
   */
  public constructor (raw: unknown, options: ModelItemOptions) {
    const source = Joi.attempt(raw, rawModelItemTemplateSchema);
    super(options);
    this.name = source.name;
    this.src = source.src;
    this.model = source.model;
    this.card = source.card;
    this.face = source.face;
  }

  public async getAnki (): Promise<string | null> {
    return await this.ankiConnection.cardFieldTemplates({
      cardName: this.card,
      field: this.face,
      modelName: this.model,
    });
  }

  public async getCompiledPug (): Promise<string> {
    return todo() as any;
  }

  public async setAnki (data: string): Promise<void> {
    return todo() as any;
  }
}
