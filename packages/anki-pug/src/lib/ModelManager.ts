import path from 'path';

import Model from './Model';
import { todo } from './util';

export default class ModelManager {
  private readonly root: string;

  public constructor (root: string) {
    this.root = path.resolve(root);
  }

  public async getModels (): Promise<Model[]> {
    const files = await this.listModels();
    return files.map(file => new Model(file, this.nameFromPath(file)));
  }

  private async listModels (): Promise<string[]> {
    return await Promise.resolve(todo(this)) as string[];
  }

  private nameFromPath (pathname: string): string {
    return todo(this, pathname) as string;
  }
}
