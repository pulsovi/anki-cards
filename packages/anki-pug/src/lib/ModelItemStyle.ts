import Joi from 'joi';

import ModelItem, { rawModelItemSchema } from './ModelItem';
import type { ModelItemOptions, RawModelItem } from './ModelItem';
import { todo } from './util/todo';

interface RawModelItemStyle extends RawModelItem {

  /** path of the source file */
  src: string;

  /** content type of the file */
  contentType?: 'text';
}
const rawModelItemStyleSchema: Joi.Schema<RawModelItemStyle> = rawModelItemSchema.append({
  contentType: Joi.valid('text').optional(),
  type: Joi.valid('style').required(),
});

export default class ModelItemStyle extends ModelItem<string> {
  public static readonly TYPE = 'style';
  public static readonly RAW_SCHEMA = rawModelItemStyleSchema;

  public readonly name: string;
  public readonly src: string;
  public readonly contentType = 'text';

  /**
   * @param raw Must be RawModelItemStyle
   */
  public constructor (raw: unknown, options: ModelItemOptions) {
    const source = Joi.attempt(raw, rawModelItemStyleSchema);
    super(options);
    this.name = source.name;
    this.src = source.src;
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
