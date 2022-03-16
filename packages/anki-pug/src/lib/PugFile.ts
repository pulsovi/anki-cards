import { compileFile } from 'pug';
import type { compileTemplate } from 'pug';

import type { TaskSyncer } from './util';

export default class PugFile {
  private readonly pugFile: string;
  private readonly name: string;

  public constructor (pugFile: string, name: string) {
    this.pugFile = pugFile;
    this.name = name;
  }

  public async compile (_syncer?: TaskSyncer): Promise<compileTemplate> {
    return await Promise.resolve(compileFile(this.pugFile));
  }
}
