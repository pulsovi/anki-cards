import type Joi from 'joi';

export interface RawModelItem {
  type?: string;
}

/**
 * Represents one of the resources that make up a note template on Anki: a card
 * face template, a CSS style file or a media file.
 */
export default abstract class ModelItem {
  public abstract readonly name: string;

  /**
   * A Joi schema that ensures that the provided object can be used to build
   * this variation of ModelItem
   */
  public abstract readonly rawSchema: Joi.AnySchema;

  /** Return the name of this item */
  public getName (): string {
    return this.name;
  }

  /** Return the compiled contents of the pug version of this model item */
  public abstract getCompiledPug (): Promise<string>;

  /**
   * Assign in Anki the provided content for this item
   *
   * @param data The new content of this item
   */
  public abstract setAnki (data: string): Promise<void>;

  /**
   * Get from Anki the content of this model item
   *
   * @return The Anki content for this model item if found, null otherwise
   */
  public abstract getAnki (): Promise<string | null>;
}
