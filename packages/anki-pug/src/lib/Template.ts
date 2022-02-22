import type Model from './Model';
import type { RawTemplate } from './types';

/*
 * declare interface RawTemplate {
 *   name: string;
 *   pugFile: string;
 *   template?: compileTemplate;
 *   locals?: Record<string, string>;
 *   htmlFile: string;
 * }
 */

export default class Template {
  private readonly model: Model;
  private readonly raw: RawTemplate;

  public constructor (raw: RawTemplate, model: Model) {
    this.model = model;
    this.raw = raw;
  }
}
