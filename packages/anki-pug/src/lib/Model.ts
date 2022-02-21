import Template from './Template';
import { todo } from './util';

export default class Model {
  private readonly modulepath: string;
  private readonly name: string;

  public constructor (modulepath: string, name: string) {
    this.modulepath = modulepath;
    this.name = name;
  }

  public async getAllTemplates (): Promise<Template[]> {
    return await Promise.resolve(todo(this, Template) as Template[]);
  }

  public getName (): string {
    return this.name;
  }
}
