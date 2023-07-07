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
      let fullfilled = false;
      let error: unknown = null;
      const templateDiffManagerLike = {
        getModelItem () {
          return {
            getAnki: async () => await Promise.resolve('same_text'),
            getCompiledPug: async () => await Promise.resolve('same_text'),
            getName: () => 'templateLike',
          } as Partial<ModelItem> as ModelItem;
        },
        modelDiffManager: {
          isManageable () { return false; },
        } as Partial<ModelDiffManager> as ModelDiffManager,
        prompt (): void { prompted = true; },
      } as Partial<ModelItemDiffManager> as ModelItemDiffManager;
      const diffConfigLike = {} as DiffConfig;
      const syncer = new TaskSyncer('wait for template name prompted before resolve');
      const firstTicket = syncer.getTicket();

      // Act
      ModelItemDiffManager.prototype.process.bind(templateDiffManagerLike)(
        diffConfigLike, syncer.getTicket()
      ).then(() => { fullfilled = true; }, err => { error = err; });

      // Assert

      // Si le prompt n'attend pas le ticket, ce bloc échouera
      await new Promise(rs => { setTimeout(rs, 300); });
      expect(fullfilled).toBe(false);
      expect(error).toBeNull();
      expect(prompted).toBe(false);

      // si le ticket ne se déclenche pas, ce bloc échouera
      firstTicket.close();
      await new Promise(rs => { setTimeout(rs, 300); });
      expect(fullfilled).toBe(true);
      expect(error).toBeNull();
      expect(prompted).toBe(true);
    });
  });
});
