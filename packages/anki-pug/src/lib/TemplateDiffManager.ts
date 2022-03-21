import type ModelDiffManager from './ModelDiffManager';
import type Template from './Template';
import TemplateDiffMenu from './TemplateDiffMenu';
import type { DiffConfig } from './types';
import type { TaskSyncer } from './util';

export default class TemplateDiffManager {
  private readonly modelDiffManager: ModelDiffManager;
  private readonly template: Template;

  public constructor (template: Template, modelDiffManager: ModelDiffManager) {
    this.modelDiffManager = modelDiffManager;
    this.template = template;
  }

  public async process (diffConfig: DiffConfig, syncer: TaskSyncer): Promise<void> {
    const [rawOutput, compiledPug] = await Promise.all([
      this.template.getCurrentOutput(),
      this.template.getCompiledPug(),
    ]);

    if (rawOutput === compiledPug) return;

    const modelIsManageable = await syncer.enqueue(
      async ticket => await this.modelDiffManager.isManageable(diffConfig, ticket)
    );
    if (!modelIsManageable) return;

    const diffMenu = new TemplateDiffMenu();
    await diffMenu.process(syncer);
  }
}
