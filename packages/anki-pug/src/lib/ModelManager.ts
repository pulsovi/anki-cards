import path from 'path';

import Model from './Model';
import { todo } from './util';

export default class ModelManager {
  private readonly root: string;

  public constructor (root: string) {
    this.root = path.resolve(root);
  }

  public async getModels (): Promise<Model[]> {
    return await Promise.resolve(todo(this, Model)) as Model[];
  }
}
