import 'core-js/actual/aggregate-error';

import ImportErrorManager from '../../src/lib/ErrorManager/ImportErrorManager';
import type ModuleLoader from '../../src/lib/ModuleLoader';

describe('ImportErrorManager', () => {
  describe('constructor', () => {
    it('throws if error cannot be managed', () => {
      // Arrange
      const errorLike = { message: 'error like object', name: 'test error' };
      const moduleLoaderLike = {} as ModuleLoader<unknown>;

      // Act
      function builder (): ImportErrorManager<unknown> {
        return new ImportErrorManager(errorLike, moduleLoaderLike);
      }

      // Assert
      expect(builder).toThrow('Unable to manage this error');
    });
    it('throws AggregateError if no "code" property provided', () => {
      // Arrange
      const errorLike = { message: 'error like object', name: 'test error' };
      const moduleLoaderLike = {} as ModuleLoader<unknown>;

      // Act
      function builder (): ImportErrorManager<unknown> {
        return new ImportErrorManager(errorLike, moduleLoaderLike);
      }

      // Assert
      expect(builder).toThrow(AggregateError);
    });
    it('throws if no "code" property provided', () => {
      // Arrange
      const errorLike = { message: 'error like object', name: 'test error' };
      const moduleLoaderLike = {} as ModuleLoader<unknown>;

      // Act
      function builder (): ImportErrorManager<unknown> {
        try {
          return new ImportErrorManager(errorLike, moduleLoaderLike);
        } catch (err: unknown) {
          const error = err as AggregateError;
          throw error.errors[0];
        }
      }

      // Assert
      expect(builder).toThrowWithMessage(
        TypeError,
        'Only errors with a "code" property of type string can be handled.'
      );
    });
  });
});
