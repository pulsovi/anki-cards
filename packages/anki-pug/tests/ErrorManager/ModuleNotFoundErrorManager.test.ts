import 'core-js/actual/aggregate-error';

import ModuleNotFoundErrorManager from '../../src/lib/ErrorManager/ModuleNotFoundErrorManager';
import type { ModuleNotFoundError } from '../../src/lib/ErrorManager/ModuleNotFoundErrorManager';
import type { ErrorWithCode } from '../../src/lib/ErrorManager/types';
import * as chokidarUtils from '../../src/lib/util/chokidarOnce';
import { getDeferredPromise } from '../../src/lib/util/deferredPromise';

describe('ModuleNotFoundErrorManager', () => {
  describe('constructor', () => {
    it('throws if no "code" property provided', () => {
      // Arrange
      const errorLike = { message: 'error like object' } as unknown as ModuleNotFoundError;

      // Act
      function builder (): ModuleNotFoundErrorManager {
        return new ModuleNotFoundErrorManager(errorLike);
      }

      // Assert
      expect(builder).toThrowWithMessage(
        AggregateError,
        'Unable to manage this error'
      );
    });
  });
  describe('manage', () => {
    it('resolves when file change', async () => {
      // Arrange
      const { promise, resolve } = getDeferredPromise<[string, string]>();
      let done = false;
      const error = Object.assign(Object.create(Error), {
        code: 'MODULE_NOT_FOUND',
        message: "Cannot find module './foo'\n",
        requireStack: [__filename],
      }) as ErrorWithCode;
      const manager = new ModuleNotFoundErrorManager(error);

      // Act
      jest.spyOn(console, 'info').mockImplementation(() => { /* do nothing */ });
      jest.spyOn(chokidarUtils, 'chokidarOnce').mockImplementation(async () => await promise);
      manager.manage().finally(() => { done = true; });

      // Assert
      await new Promise(rs => { setTimeout(rs, 200); });
      expect(done).toBe(false);
      resolve(['add', './foo']);
      await new Promise(rs => { setTimeout(rs, 200); });
      expect(done).toBe(true);

      // Clean
      jest.restoreAllMocks();
    });
  });
});
