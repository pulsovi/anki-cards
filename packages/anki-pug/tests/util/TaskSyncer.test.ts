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
      const taskSyncer = new TaskSyncer('ticket.ready: first ticket ready is a Promise');

      // Act
      const ticket = taskSyncer.getTicket();

      // Assert
      expect(ticket.ready).toBeInstanceOf(Promise);
    });

    test('first ticket ready is not sync', () => {
      // Arrange
      const taskSyncer = new TaskSyncer('ticket.ready: first ticket ready is not sync');

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
        const taskSyncer = new TaskSyncer('ticket.ready: first ticket ready.(then|finally) is the first next tick');

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

    test('second ticket is not ready until first ticket is done', async () => {
      // Arrange
      const syncer = new TaskSyncer('ticket.ready: second ticket is not ready until first ticket is done');
      syncer.getTicket();
      const ticket2 = syncer.getTicket();
      let ticket2ready = false;

      // Act
      ticket2.ready.then(() => { ticket2ready = true; }, () => { /* do nothing */ });

      // Assert
      expect(ticket2ready).toBe(false);
      await new Promise<void>((resolve, reject) => {
        process.nextTick(() => {
          try {
            expect(ticket2ready).toBe(false);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    });

    test('second ticket is ready when first ticket is done', async () => {
      // Arrange
      const syncer = new TaskSyncer('ticket.ready: second ticket is ready when first ticket is done');
      const ticket1 = syncer.getTicket();
      const ticket2 = syncer.getTicket();
      let ticket2ready = false;

      // Act
      ticket2.ready.then(() => { ticket2ready = true; }, () => { /* do nothing */ });
      ticket1.close();

      // Assert
      expect(ticket2ready).toBe(false);
      await new Promise<void>((resolve, reject) => {
        process.nextTick(() => {
          try {
            expect(ticket2ready).toBe(true);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    });

    it('rejects if the ticket is closed before ready', async () => {
      // Arrange
      const syncer = new TaskSyncer('ticket.ready: rejects if the ticket is closed before ready');
      syncer.getTicket();
      const ticket2 = syncer.getTicket();
      const readyPromise = ticket2.ready;

      // Act
      ticket2.close();

      // Assert
      await expect(readyPromise).toReject();
    });

    it('rejects with caller in its stack error', async () => {
      // Arrange
      const syncer = new TaskSyncer('ticket.ready: rejects with caller in its stack error');
      syncer.close();

      // Act
      const error = await theUniqidCallerIsqlfnp5767sqdfsd4();

      // Assert
      expect(error.stack).toInclude('theUniqidCallerIsqlfnp5767sqdfsd4');

      async function theUniqidCallerIsqlfnp5767sqdfsd4 (): Promise<Error> {
        return await syncer.ready.catch((reason: unknown) => reason) as Error;
      }
    });
  });

  describe('ticket.enqueue', () => {
    it('returns a rejected Promise if task thrown synchronously', async () => {
      // Arrange
      const syncer = new TaskSyncer('ticket.enqueue: returns a rejected Promise if task thrown synchronously');

      // Act
      const task = syncer.enqueue(() => { throw new Error('fail'); });

      // Assert
      await expect(task).toReject();
    });
  });

  describe('sub-ticket', () => {
    test('sub-ticket is not ready if its parent is not ready', async () => {
      // Arrange
      const root = new TaskSyncer('sub-ticket is not ready if its parent is not ready');
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

    test('sub-ticket.ready rejects if its parent is done before', async () => {
      // Arrange
      const syncer = new TaskSyncer('sub-ticket.ready rejects if its parent is done before');
      syncer.getTicket();
      const ticket2 = syncer.getTicket();
      const readyPromise = ticket2.ready;

      // Act
      syncer.close();

      // Assert
      await expect(readyPromise).toReject();
    });
  });

  describe('events', () => {
    it('does not done twice', () => {
      // Arrange
      const syncer = new TaskSyncer('events: does not done twice');
      let first = false;
      let second = false;

      syncer.on('done', () => {
        if (first) second = true;
        else first = true;
      });

      // Act
      syncer.close();
      syncer.close();

      // Assert
      expect(first).toBe(true);
      expect(second).toBe(false);
    });
  });

  describe('complexe bugs', () => {
    test('ticket close before ready does not throw "UnhandledPromiseRejectionWarning"', async () => {
      // Arrange
      const syncer = new TaskSyncer('UnhandledPromiseRejectionWarning');
      const ticket1 = syncer.getTicket();

      syncer.getTicket();

      // Act
      // ticket1.ready.catch(() => { /* do nothing */ });
      ticket1.close();
      await new Promise(rs => { setTimeout(rs, 500); });

      // Assert
      expect(true).toBe(true);
    });

    describe('MaxListenersExceededWarning', () => {
      // eslint-disable-next-line multiline-comment-style
      // Unable to check process.on('warning', ...)
      // see: https://johann.pardanaud.com/blog/how-to-assert-unhandled-rejection-and-uncaught-exception-with-jest/
      // and: https://github.com/facebook/jest/issues/5620
      test('getTicket does not add any event listener', () => {
        // Arrange
        let listenerAdded = false;
        const syncer = new TaskSyncer();
        syncer.on('newListener', () => { listenerAdded = true; });

        // Act
        syncer.getTicket();

        // Assert
        expect(listenerAdded).toBe(false);
      });
    });
  });
});
