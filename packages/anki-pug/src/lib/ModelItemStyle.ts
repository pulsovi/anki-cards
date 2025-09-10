import path from 'path';

import fs from 'fs-extra';
import Joi from 'joi';

import ModelItem, { rawModelItemSchema } from './ModelItem';
import type { ModelItemOptions, RawModelItem } from './ModelItem';

interface RawModelItemStyle extends RawModelItem {

  /** path of the source file */
  src: string;

  /** content type of the file */
  contentType?: 'text';

  /** Name of the model containing this template */
  model: string;
}
const rawModelItemStyleSchema: Joi.Schema<RawModelItemStyle> = rawModelItemSchema.append({
  contentType: Joi.valid('text').optional(),
  model: Joi.string().required(),
  type: Joi.valid('style').required(),
});

export default class ModelItemStyle extends ModelItem<string> {
  public static readonly TYPE = 'style';
  public static readonly RAW_SCHEMA = rawModelItemStyleSchema;

  public readonly name: string;
  public readonly src: string;
  public readonly contentType = 'text';
  public readonly model: string;

  /**
   * @param raw Must be RawModelItemStyle
   */
  public constructor (raw: unknown, options: ModelItemOptions) {
    const source = Joi.attempt(raw, rawModelItemStyleSchema);
    super(options);
    this.name = source.name;
    this.model = source.model;
    this.src = source.src;
  }

  public async getAnki (): Promise<Error | string | null> {
    return await this.ankiConnection.getCSS({ modelName: this.model })
      .catch(error => error as Error);
  }

  public async getCompiledPug (): Promise<Error | string> {
    if (path.extname(this.src) === '.css') {
      return await fs.readFile(this.src, 'utf8').catch(error => error);
    }
    throw new Error(`Impossible de compiler ce type de fichier ${this.src}`);
  }

  public async setAnki (data: string): Promise<void> {
    await this.ankiConnection.updateModelStyling({ css: data, modelName: this.model });
  }
}
