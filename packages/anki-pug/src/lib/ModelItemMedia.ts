import fs from 'fs-extra';
import Joi from 'joi';

import ModelItem, { rawModelItemSchema } from './ModelItem';
import type { ModelItemOptions, RawModelItem } from './ModelItem';
import { todo } from './util/todo';

interface RawModelItemMedia extends RawModelItem {
  type: 'media';

  /** path of the media source file */
  src: string;

  /** content type of the file */
  contentType?: 'binary' | 'text';
}
const rawModelItemMediaSchema = rawModelItemSchema.append({
  type: Joi.valid('media').required(),
  contentType: Joi.valid('binary', 'text').optional(),
});

export default class ModelItemMedia extends ModelItem<Buffer> {
  public static readonly TYPE = 'media';
  public static readonly RAW_SCHEMA = rawModelItemMediaSchema;

  public readonly name: string;
  public readonly src: string;
  public readonly contentType: 'binary' | 'text';

  public constructor (raw: RawModelItemMedia, options: ModelItemOptions) {
    Joi.assert(raw, rawModelItemMediaSchema);
    super(options);
    this.name = raw.name;
    this.src = raw.src;
    this.contentType = raw.contentType ?? 'binary';
  }

  public async getAnki (): Promise<Buffer | null> {
    // https://foosoft.net/projects/anki-connect/index.html#retrievemediafile
    return await this.ankiConnection.retrieveMediaFile({ filename: this.name });
  }

  public async getCompiledPug (): Promise<Buffer> {
    return await fs.readFile(this.src);
  }

  public async setAnki (data: Buffer): Promise<void> {
    await todo(null, data, this);
  }
}
