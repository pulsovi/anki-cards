import fs from 'fs-extra';
import Joi from 'joi';
import type { LocalsObject } from 'pug';

import type Model from './Model';
import PugFile from './PugFile';
import type { SyncOrPromise } from './types';
import { TaskSyncer } from './util';

export type RawTemplate = {
  locals?: Record<string, string>;
  name: string;
  outputFile: string;
} & ({
  pugFile: string;
  template: undefined;
} | {
  pugFile: undefined;
  template: (locals?: LocalsObject) => SyncOrPromise<string>;
});

export const rawTemplateSchema = Joi.object({
  locals: Joi.object(),
  name: Joi.string().required(),
  outputFile: Joi.string().required(),
  pugFile: Joi.string(),
  template: Joi.when('pugFile', {
    is: Joi.string().required(),
    otherwise: Joi.function().required(),
    then: Joi.forbidden(),
  }).messages({
    /* eslint-disable @typescript-eslint/naming-convention */
    'any.required': 'one of "template" or "pugFile" is required',
    'any.unknown': '"template" is forbidden when "pugFile" is provided',
    /* eslint-enable @typescript-eslint/naming-convention */
  }),
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

    const pugFile = new PugFile(this.raw.pugFile, this.raw.name);
    const compileTemplate = await pugFile.compile(syncer);
    return compileTemplate(this.raw.locals);
  }

  public async getCurrentOutput (): Promise<string | null> {
    if (!await fs.pathExists(this.raw.outputFile)) return null;
    return await fs.readFile(this.raw.outputFile, 'utf8');
  }

  public getModel (): Model {
    return this.model;
  }

  public getName (): string {
    return this.raw.name;
  }
}
