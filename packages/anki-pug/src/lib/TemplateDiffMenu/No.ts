import MenuItem from '../MenuItem';

export default class No extends MenuItem {
  protected readonly key: string;
  protected readonly name: string;

  public constructor () {
    super();
    this.key = 'n';
    this.name = '[no]   Skip this template';
  }

  // other concrete MenuItem can need use of `this` on `process`
  // eslint-disable-next-line class-methods-use-this
  public async process (): Promise<boolean> {
    return await Promise.resolve(true);
  }
}
