import type DiffConfig from '../src/lib/DiffConfig';
import type ModelDiffManager from '../src/lib/ModelDiffManager';
import type Template from '../src/lib/Template';
import TemplateDiffManager from '../src/lib/TemplateDiffManager';
import { TaskSyncer } from '../src/lib/util';

describe('TemplateDiffManager', () => {
  describe('process', () => {
    it('silently skip if the syncer is closed', async () => {
      // Arrange
      const templateLike = {
        getCompiledPug: async () => await Promise.resolve('compiledPug'),
        getCurrentOutput: async () => await Promise.resolve('output'),
        getName: () => 'templateLike',
      } as Template;
      const modelDiffManagerLike = {
        getTemplate: () => templateLike,
        isManageable: () => true,
      } as unknown as ModelDiffManager;
      const templateDiffManager = new TemplateDiffManager(templateLike, modelDiffManagerLike);
      const diffConfigLike = {} as DiffConfig;
      const syncer = new TaskSyncer();

      // Act
      syncer.close();
      const result = templateDiffManager.process(diffConfigLike, syncer);

      // Assert
      await expect(result).toResolve();
    });

    it('wait for template name prompted before resolve', async () => {
      // Arrange
      let prompted = false;
      const templateLike = {
        getCompiledPug: async () => await Promise.resolve('same_text'),
        getCurrentOutput: async () => await Promise.resolve('same_text'),
        getName: () => 'templateLike',
      } as Template;
      const modelDiffManagerLike = { isManageable: () => true } as unknown as ModelDiffManager;
      const templateDiffManagerLike = {
        getTemplate: () => templateLike,
        modelDiffManager: modelDiffManagerLike,
        prompt: () => { prompted = true; },
      } as unknown as TemplateDiffManager;
      const diffConfigLike = {} as DiffConfig;
      const syncer = new TaskSyncer('wait for template name prompted before resolve');
      const firstTicket = syncer.getTicket();

      // Act
      // eslint-disable-next-line prefer-reflect
      const processPromise = TemplateDiffManager.prototype.process.apply(templateDiffManagerLike, [
        diffConfigLike, syncer.getTicket(),
      ]);
      // laisser le temps à tout le code asynchrone ne dépendant pas du ticket de se dérouler
      await new Promise(rs => { setTimeout(rs, 500); });
      // permettre au prompt de se lancer
      firstTicket.close();
      // si le process n'a pas attendu le ticket, cette ligne s'executera de façon synchrone
      await processPromise;

      // Assert
      expect(prompted).toBe(true);
    });
  });
});
