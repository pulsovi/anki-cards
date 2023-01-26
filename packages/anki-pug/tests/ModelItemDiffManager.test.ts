import type DiffConfig from '../src/lib/DiffConfig';
import type ModelDiffManager from '../src/lib/ModelDiffManager';
import type ModelItem from '../src/lib/ModelItem';
import ModelItemDiffManager from '../src/lib/ModelItemDiffManager';
import { TaskSyncer } from '../src/lib/util';

describe('ModelItemDiffManager', () => {
  describe('process', () => {
    it('silently skip if the syncer is closed', async () => {
      // Arrange
      const templateLike = {
        getAnki: async () => await Promise.resolve('output'),
        getCompiledPug: async () => await Promise.resolve('compiledPug'),
        getName: () => 'templateLike',
      } as unknown as ModelItem;
      const modelDiffManagerLike = {
        getModelItem: () => templateLike,
        isManageable: () => true,
      } as unknown as ModelDiffManager;
      const templateDiffManager = new ModelItemDiffManager(templateLike, modelDiffManagerLike);
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
        getAnki: async () => await Promise.resolve('same_text'),
        getCompiledPug: async () => await Promise.resolve('same_text'),
        getName: () => 'templateLike',
      } as Partial<ModelItem> as ModelItem;
      const modelDiffManagerLike = { isManageable: () => true } as unknown as ModelDiffManager;
      const templateDiffManagerLike = {
        getModelItem: () => templateLike,
        modelDiffManager: modelDiffManagerLike,
        prompt: () => { prompted = true; },
      } as unknown as ModelItemDiffManager;
      const diffConfigLike = {} as DiffConfig;
      const syncer = new TaskSyncer('wait for template name prompted before resolve');
      const firstTicket = syncer.getTicket();

      // Act
      // eslint-disable-next-line prefer-reflect
      const processPromise = ModelItemDiffManager.prototype.process.apply(templateDiffManagerLike, [
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
