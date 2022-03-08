import { getDeferredPromise } from './deferredPromise';
import type { DeferredPromise } from './deferredPromise';

export class TaskSyncer {
  public readonly close: () => void;
  public readonly done: Promise<void>;
  public ready: Promise<void>;

  private readonly tickets: TaskSyncer[] = [];
  private readonly number: number;
  private currentTicket = 0;
  private readonly name: string;
  private isReady = false;
  private wasReady = false;
  private status: 'done' | 'pending' | 'running' = 'pending';

  public constructor (
    name?: string,
    parent?: TaskSyncer,
    number = 0
  ) {
    if (name) this.name = parent ? `${parent.name}:${name}` : name;
    else this.name = parent ? `${parent.name}[${number}]` : 'root';
    this.number = number;

    const deferredPromise: DeferredPromise<void> = getDeferredPromise();
    this.close = deferredPromise.resolve;
    this.done = deferredPromise.promise.finally(() => {
      this.isReady = false;
      this.status = 'done';
    });
    this.ready = new Promise<void>((resolve, reject) => {
      if (this.status === 'done') reject(new Error('The ticket is already done.'));
      this.done.finally(() => { reject(new Error('The ticket is already done.')); });
      if (parent) parent.getReady(number).then(resolve, reject);
      else resolve();
    }).then(() => {
      this.isReady = true;
      this.wasReady = true;
      this.status = 'running';
    });

    if (parent) parent.done.finally(() => { this.close(); }).catch(() => { /* do nothing */ });
  }

  public async enqueue<U> (task: (syncer: TaskSyncer) => Promise<U>, name?: string): Promise<U> {
    const ticket = this.getTicket(name);
    await ticket.ready;
    const status: {
      isError: boolean;
      value?: U;
      reason?: unknown;
    } = { isError: false };
    try {
      status.value = await task(ticket);
    } catch (error) {
      status.isError = true;
      status.reason = error;
    }
    ticket.close();
    if (status.isError) throw status.reason;
    return status.value as U;
  }

  public getTicket<T extends number | string | undefined> (
    index?: T
  ): T extends number ? TaskSyncer | undefined : TaskSyncer {
    if (typeof index === 'number') return this.tickets[index];

    const number = this.tickets.length;
    const ticket = new TaskSyncer(index, this, number);

    this.tickets.push(ticket);
    ticket.ready.finally(() => { this.currentTicket = number; });
    return ticket;
  }

  private async getReady (index: number): Promise<void> {
    await new Promise((resolve, reject) => {
      this.done.finally(() => { reject(new Error('The syncer is already closed.')); });
      Promise.allSettled(this.tickets.slice(0, index).map(async ticket => { await ticket.done; }))
        .finally(() => { resolve(this.ready); });
    });
  }
}
