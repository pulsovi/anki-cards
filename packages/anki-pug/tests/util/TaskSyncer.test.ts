import { TaskSyncer } from '../../src/lib/util/TaskSyncer';

describe('TaskSyncer', () => {
  describe('getTicket', () => {
    test('without parameter, it returns a TaskSyncer instance', () => {
      // Arrange
      const taskSyncer = new TaskSyncer();

      // Act
      const ticket = taskSyncer.getTicket();

      // Assert
      expect(ticket).toBeInstanceOf(TaskSyncer);
    });
  });

  describe('ticket.ready', () => {
    test('first ticket ready is a Promise', () => {
      // Arrange
      const taskSyncer = new TaskSyncer();

      // Act
      const ticket = taskSyncer.getTicket();

      // Assert
      expect(ticket.ready).toBeInstanceOf(Promise);
    });

    test('first ticket ready is not sync', () => {
      // Arrange
      const taskSyncer = new TaskSyncer();

      // Act
      const ticket = taskSyncer.getTicket();

      // Assert
      let ready = false;
      ticket.ready.finally(() => { ready = true; });
      expect(ready).toBe(false);
    });

    test('first ticket ready.(then|finally) is the first next tick', async () => {
      await new Promise<void>((resolve, reject) => {
        // Arrange
        const taskSyncer = new TaskSyncer();

        // Act
        const ticket = taskSyncer.getTicket();

        // Assert
        let ready = false;
        ticket.ready.finally(() => { ready = true; });

        /*
         * expects ticket.ready.finally to be the first next asynchronous task to runs
         * launching assertion test by the fastest of all the asynchronous call methods
         *
         * Versions  that use "Promise" are disabled because jest favors "Promises" created in the
         *   test file and runs them faster than external "Promise.resolve" and even faster than
         *   "process.nextTick" !! ?
         */
        setImmediate(assertion.bind(null, 'setImmediate'));
        // (async (): Promise<void> => { /* empty */ })().finally(assertion.bind(null, 'async'));
        setTimeout(assertion.bind(null, 'setTimeout'));
        // Promise.resolve().finally(assertion.bind(null, 'Promise.resolve'));
        process.nextTick(assertion.bind(null, 'process.nextTick'));
        // new Promise<void>(rs => { rs(); }).finally(assertion.bind(null, 'new Promise'));

        function assertion (from: string): void {
          try {
            expect(`${from}: ${String(ready)}`).toBe(`${from}: ${String(true)}`);
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  });

  describe('sub-ticket', () => {
    test('sub-ticket is not ready if its parent is not ready', async () => {
      // Arrange
      const root = new TaskSyncer();
      let p1Ready = false;
      let p2Ready = false;
      let childReady = false;
      const parent1 = root.getTicket();
      const parent2 = root.getTicket();
      const child = parent2.getTicket();

      // Run
      parent1.ready.finally(() => { p1Ready = true; });
      parent2.ready.finally(() => { p2Ready = true; });
      child.ready.finally(() => { childReady = true; });

      // Assert
      await parent1.ready;
      expect(p1Ready).toBe(true);
      expect(p2Ready).toBe(false);
      expect(childReady).toBe(false);
    });
  });
});
