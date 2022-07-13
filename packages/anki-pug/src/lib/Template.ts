import Joi from 'joi';
import type { LocalsObject } from 'pug';

import type Model from './Model';
import PugFile from './PugFile';
import type { SyncOrPromise } from './types';
import { ankiConnection, TaskSyncer, todo } from './util';

export type RawTemplate = {
  locals?: Record<string, string>;
  name: string;
} & ({
  pugFile: never;
  template: (locals?: LocalsObject) => SyncOrPromise<string>;
} | {
  pugFile: string;
  template: undefined;
});

export const rawTemplateSchema = Joi.object({
  locals: Joi.object(),
  name: Joi.string().required(),
  outputFile: Joi.forbidden().messages({
    'any.unknown': '"outputFile" is deprecated in favor of AnkiConnect.' +
      'Please delete it and make sure the name of the model and the board match ' +
      'those registered in anki',
  }),
  pugFile: Joi.string(),
  template: Joi.when('pugFile', {
    is: Joi.string().required(),
    otherwise: Joi.function().required(),
    then: Joi.forbidden(),
  }).messages({

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

  public async getAnki (): Promise<string | null> {
    const field = this.getField();
    const modelName = this.model.getName();

    if (field === 'CSS') return await ankiConnection.getCSS({ modelName });
    return await ankiConnection.cardFieldTemplates({
      cardName: this.getCardName(),
      field,
      modelName,
    });
  }

  public getField (): 'Back' | 'CSS' | 'Front' {
    switch (this.getName().split('_').pop()) {
    case 'verso': return 'Back';
    case 'recto': return 'Front';
    case 'style': return 'CSS';
    default: return todo(`getField ${this.getName()}`) as 'Back';
    }
  }

  public getCardName (): string {
    return this.getName().split('_')[0];
  }

  public getModel (): Model {
    return this.model;
  }

  public getName (): string {
    return this.raw.name;
  }

  public async setAnki (data: string): Promise<void> {
    await todo(this, data);
  }
}
