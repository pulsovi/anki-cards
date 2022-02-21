import { todo } from './util';

export default class ModelDiffManager {
  private readonly root: string;

  public constructor (root: string) {
    this.root = root;
  }

  public async processAll (): Promise<void> {
    await Promise.resolve(todo(this));
  }
}
