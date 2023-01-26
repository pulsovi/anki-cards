import path from 'path';

import readdirp from 'readdirp';

import Model from './Model';
import type { ModelServices } from './Model';

export type ModelCollectionManagerServices = ModelServices;

/** Manage all Anki note models of a collection */
export default class ModelCollectionManager {
  public static readonly EXPORT_FILENAME = 'export.js';

  private readonly services: ModelCollectionManagerServices;
  private readonly root: string;

  public constructor (root: string, services: ModelCollectionManagerServices) {
    this.root = path.resolve(root);
    this.services = services;
  }

  public async getModels (): Promise<Model[]> {
    const files = await this.listModels();
    return files.map(file => new Model(file, this.nameFromPath(file), this.services));
  }

  private async listModels (): Promise<string[]> {
    const files = await readdirp.promise(this.root, {
      fileFilter: ModelCollectionManager.EXPORT_FILENAME,
    });
    return files
      .map(file => file.fullPath)
      .sort((strA, strB) => strA.localeCompare(strB));
  }

  private nameFromPath (pathname: string): string {
    const dirname = pathname.endsWith(ModelCollectionManager.EXPORT_FILENAME) ?
      path.dirname(pathname) :
      pathname;
    return path.relative(this.root, dirname).replace(new RegExp(`\\${path.sep}`, 'gu'), '::');
  }
}
