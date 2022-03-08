import fs from 'fs-extra';
import Joi from 'joi';
import type { LocalsObject } from 'pug';

import type Model from './Model';
import PugFile from './PugFile';
import type { SyncOrPromise } from './types';
import { TaskSyncer } from './util';

export interface RawTemplate {
  htmlFile: string;
  locals?: Record<string, string>;
  name: string;
  pugFile: string;
  template?: (locals?: LocalsObject) => SyncOrPromise<string>;
}

export const rawTemplateSchema = Joi.object({
  htmlFile: Joi.string().required(),
  locals: Joi.object(),
  name: Joi.string().required(),
  pugFile: Joi.string().required(),
  template: Joi.function(),
});

export default class Template {
  private readonly model: Model;
  private readonly raw: RawTemplate;

  public constructor (raw: RawTemplate, model: Model) {
    this.model = model;
    Joi.assert(raw, rawTemplateSchema);
    this.raw = raw;
  }

  public async getCompiledPug (syncer = new TaskSyncer()): Promise<string> {
    if (this.raw.template) return await this.raw.template(this.raw.locals);

    const pugLoader = new PugFile(this.raw.pugFile, this.raw.name);
    const compileTemplate = await pugLoader.compile(syncer);
    return compileTemplate(this.raw.locals);
  }

  public async getRawHtml (): Promise<string | null> {
    if (!await fs.pathExists(this.raw.htmlFile)) return null;
    return await fs.readFile(this.raw.htmlFile, 'utf8');
  }
}
