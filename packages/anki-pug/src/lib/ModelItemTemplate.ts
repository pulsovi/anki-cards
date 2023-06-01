import Joi from 'joi';
import type TaskSyncer from 'task-syncer';

import ModelItem, { rawModelItemSchema } from './ModelItem';
import type { ModelItemOptions, RawModelItem } from './ModelItem';
import PugFile from './PugFile';
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
  side: 'Back' | 'Front';

  /** Locals to use when render the pug template */
  locals?: Record<string, string>;
}
const rawModelItemTemplateSchema: Joi.Schema<RawModelItemTemplate> = rawModelItemSchema.append({
  card: Joi.string().required(),
  contentType: Joi.valid('text').optional(),
  locals: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  model: Joi.string().required(),
  side: Joi.valid('Back', 'Front').required(),
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
  public readonly side: 'Back' | 'Front';

  private readonly locals?: Record<string, string>;

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
    this.side = source.side;
    this.locals = source.locals;
  }

  public async getAnki (): Promise<Error | string | null> {
    return await this.ankiConnection.cardSideTemplates({
      modelName: this.model,
      cardName: this.card,
      side: this.side,
    }).catch(error => error as Error);
  }

  public async getCompiledPug (syncer?: TaskSyncer): Promise<string> {
    if (!this.src.endsWith('.pug')) throw new Error(`Impossible de récupérer le code html de ce template <${this.src}>, seuls les fichier .pug sont admis.`);
    const pugFile = new PugFile(this.src, this.name);
    const compileTemplate = await pugFile.compile(syncer);
    return compileTemplate(this.locals);
  }

  public async setAnki (data: string): Promise<void> {
    await this.ankiConnection.updateCardSideTemplate({
      modelName: this.model,
      cardName: this.card,
      side: this.side,
      value: data,
    });
  }
}
