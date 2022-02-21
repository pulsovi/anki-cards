import path from 'path';

import readdirp from 'readdirp';

import Model from './Model';

export default class ModelManager {
  public static readonly EXPORT_FILENAME = 'export.js';
  private readonly root: string;

  public constructor (root: string) {
    this.root = path.resolve(root);
  }

  public async getModels (): Promise<Model[]> {
    const files = await this.listModels();
    return files.map(file => new Model(file, this.nameFromPath(file)));
  }

  private async listModels (): Promise<string[]> {
    const files = await readdirp.promise(this.root, { fileFilter: ModelManager.EXPORT_FILENAME });
    return files
      .map(file => file.fullPath)
      .sort((strA, strB) => strA.localeCompare(strB));
  }

  private nameFromPath (pathname: string): string {
    const dirname = pathname.endsWith(ModelManager.EXPORT_FILENAME) ?
      path.dirname(pathname) :
      pathname;
    return path.relative(this.root, dirname).replace(new RegExp(`\\${path.sep}`, 'gu'), '::');
  }
}
