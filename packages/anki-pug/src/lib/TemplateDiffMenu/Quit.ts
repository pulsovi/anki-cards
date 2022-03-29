import type DiffConfig from '../DiffConfig';
import MenuItem from '../MenuItem';

export default class Quit extends MenuItem {
  protected readonly key: string;
  protected readonly name: string;

  public constructor () {
    super();
    this.key = 'q';
    this.name = '[quit] Skip all unmanaged models/templates and quit the diff';
  }

  // other concrete MenuItem can need use of `this` on `process`
  // eslint-disable-next-line class-methods-use-this
  public async process (diffConfig: DiffConfig): Promise<boolean> {
    diffConfig.haveToQuit(true);
    return await Promise.resolve(true);
  }
}
