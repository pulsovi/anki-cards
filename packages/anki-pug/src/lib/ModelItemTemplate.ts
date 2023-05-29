import fs from 'fs-extra';
import Joi from 'joi';

import ModelItem, { rawModelItemSchema } from './ModelItem';
import type { ModelItemOptions, RawModelItem } from './ModelItem';
import { todo } from './util/todo';

interface RawModelItemTemplate extends RawModelItem {
  /** path of the template pug source file */
  src: string;

  /** content type of the file */
  contentType?: 'text';
}
const rawModelItemTemplateSchema = rawModelItemSchema.append({
  contentType: Joi.valid('text').optional(),
  type: Joi.valid('template').required(),
});

export default class ModelItemTemplate extends ModelItem<string> {
  public static readonly TYPE = 'template';
  public static readonly RAW_SCHEMA = rawModelItemTemplateSchema;

  public readonly name: string;
  public readonly src: string;
  public readonly contentType = 'text';

  public constructor (raw: RawModelItemTemplate, options: ModelItemOptions) {
    Joi.assert(raw, rawModelItemTemplateSchema);
    super(options);
    this.name = raw.name;
    this.src = raw.src;
  }

  public async getAnki (): Promise<string | null> {
    return todo() as any;
  }

  public async getCompiledPug (): Promise<string> {
    return todo() as any;
  }

  public async setAnki (data: string): Promise<void> {
    return todo() as any;
  }
}
