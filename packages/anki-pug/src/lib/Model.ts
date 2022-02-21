export default class Model {
  private readonly modulepath: string;
  private readonly name: string;

  public constructor (modulepath: string, name: string) {
    this.modulepath = modulepath;
    this.name = name;
  }

  public getName (): string {
    return this.name;
  }
}
