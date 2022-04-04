import TemplateDiffMenuItem from './TemplateDiffMenuItem';

export default class NoDiffResponse extends TemplateDiffMenuItem {
  public async act (): Promise<boolean> {
    return await Promise.resolve(true);
  }

  public getSyncResponse ([pugRendered, html]: [string, string]): this | null {
    if (pugRendered === html) return this;
    return null;
  }
}
