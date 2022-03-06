import fs from 'fs-extra';

import type Model from './Model';
import PugFile from './PugFile';
import type { RawTemplate } from './types';
import { TaskSyncer } from './util';

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

  public async getCompiledPug (syncer = new TaskSyncer()): Promise<string> {
    if (this.raw.template) return this.raw.template(this.raw.locals);

    const pugLoader = new PugFile(this.raw.pugFile, this.raw.name);
    const compileTemplate = await pugLoader.compile(syncer);
    return compileTemplate(this.raw.locals);
  }

  public async getRawHtml (): Promise<string | null> {
    if (!await fs.pathExists(this.raw.htmlFile)) return null;
    return await fs.readFile(this.raw.htmlFile, 'utf8');
  }
}
