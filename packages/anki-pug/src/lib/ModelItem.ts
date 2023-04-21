import Joi from 'joi';

/** The type a model item can be */
export type ModelItemType = Buffer | string;

type ShallowCopy<T> = { [K in keyof T]: T[K] };

/** A concrete extension of ModelItem class */
export type ModelItemConcrete = ShallowCopy<typeof ModelItem> &
(new (raw: RawModelItem) => ModelItem);

export interface RawModelItem {

  /** The name of this item */
  name: string;

  /** The type of the model item : template, style, media */
  type: 'media';
}
export const rawModelItemSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.valid('media').required(),
});

/**
 * Represents one of the resources that make up a note template on Anki: a card
 * face template, a CSS style file or a media file.
 */
export default abstract class ModelItem<T extends ModelItemType = ModelItemType> {
  /** The type of the model item, can be template, stylesheet, media, ... */
  public static readonly TYPE: string;

  /**
   * A Joi schema that ensures that the provided object can be used to build
   * this variation of ModelItem
   */
  public static readonly RAW_SCHEMA: Joi.AnySchema;

  /** The name of this item, such "Card1_recto" or "background_img", ... */
  public abstract readonly name: string;

  /** Return the name of this item */
  public getName (): string {
    return this.name;
  }

  /** Return the compiled contents of the pug version of this model item */
  public abstract getCompiledPug (): Promise<T>;

  /**
   * Assign in Anki the provided content for this item
   *
   * @param data The new content of this item
   */
  public abstract setAnki (data: T): Promise<void>;

  /**
   * Get from Anki the content of this model item
   *
   * @return The Anki content for this model item if found, null otherwise
   */
  public abstract getAnki (): Promise<T | null>;
}
