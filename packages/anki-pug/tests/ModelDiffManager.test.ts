import type DiffConfig from '../src/lib/DiffConfig';
import type Model from '../src/lib/Model';
import ModelDiffManager from '../src/lib/ModelDiffManager';
import { TaskSyncer } from '../src/lib/util';

describe('ModelDiffManager', () => {
  describe('process', () => {
    it('silently skip if the syncer is closed', async () => {
      // Arrange
      const modelLike = {
        getAllTemplates: async (syncer: TaskSyncer) => await syncer.enqueue(
          async () => await Promise.resolve('getAllTemplates')
        ),
        getName: () => 'modelLike',
      } as unknown as Model;
      const modelDiffManager = new ModelDiffManager(modelLike);
      const diffConfigLike = {} as DiffConfig;
      const syncer = new TaskSyncer();

      // Act
      syncer.close();
      const result = modelDiffManager.process(diffConfigLike, syncer);

      // Assert
      await expect(result).toResolve();
    });
  });
});
