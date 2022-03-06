import fs from 'fs-extra';

import type Model from './Model';
import type { RawTemplate } from './types';
import { todo } from './util';

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

  public async getCompiledPug (): Promise<string> {
    return await Promise.resolve(todo(this) as string);
  }

  public async getRawHtml (): Promise<string | null> {
    if (!await fs.pathExists(this.raw.htmlFile)) return null;
    return await fs.readFile(this.raw.htmlFile, 'utf8');
  }
}
