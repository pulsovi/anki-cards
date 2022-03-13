import 'core-js/actual/aggregate-error';

import { displayError } from '../../src/lib/ErrorManager/displayError';

describe('displayError', () => {
  it('displays AggregateError errors', () => {
    // Arrange
    let acceded = false;
    const error = new AggregateError([], 'parent');

    Reflect.defineProperty(error, 'errors', {
      get (): Error[] {
        acceded = true;
        return [new Error('child')];
      },
    });

    // Act
    displayError(error);

    // Assert
    expect(acceded).toBe(true);
  });
});
