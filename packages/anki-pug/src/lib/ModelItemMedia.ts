import Joi from 'joi';

import ModelItem, { rawModelItemSchema } from './ModelItem';
import type { ModelItemOptions, RawModelItem } from './ModelItem';
import { todo } from './util/todo';

interface RawModelItemMedia extends RawModelItem {
  type: 'media';
}
const rawModelItemMediaSchema = rawModelItemSchema.append({
  type: Joi.valid('media').required(),
});

export default class ModelItemMedia extends ModelItem<Buffer> {
  public static readonly TYPE = 'media';
  public static readonly RAW_SCHEMA = rawModelItemMediaSchema;

  public readonly name: string;
  public readonly raw: RawModelItemMedia;

  public constructor (raw: RawModelItemMedia, options: ModelItemOptions) {
    Joi.assert(raw, rawModelItemMediaSchema);
    super(options);
    this.name = raw.name;
    this.raw = raw;
  }

  public async getAnki (): Promise<Buffer> {
    // https://foosoft.net/projects/anki-connect/index.html#retrievemediafile
    return await Promise.resolve(todo(null, this) as Buffer);
  }

  public async getCompiledPug (): Promise<Buffer> {
    return await Promise.resolve(todo(null, this) as Buffer);
  }

  public async setAnki (data: Buffer): Promise<void> {
    await todo(null, data, this);
  }
}
