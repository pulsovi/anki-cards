import type ModelDiffManager from './ModelDiffManager';
import type Template from './Template';
import type { DiffConfig } from './types';
import { todo } from './util';

export default class TemplateDiffManager {
  private readonly modelDiffManager: ModelDiffManager;
  private readonly template: Template;

  public constructor (template: Template, modelDiffManager: ModelDiffManager) {
    this.modelDiffManager = modelDiffManager;
    this.template = template;
  }

  public async process (diffConfig: DiffConfig): Promise<void> {
    const [rawHtml, compiledPug] = await Promise.all([
      this.template.getRawHtml(),
      this.template.getCompiledPug(),
    ]);

    if (rawHtml === compiledPug) return;
    await Promise.resolve(todo(this, diffConfig));
  }
}
