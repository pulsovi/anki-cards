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
  });
});
