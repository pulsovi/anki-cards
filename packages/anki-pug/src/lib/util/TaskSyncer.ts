import EventEmitter from 'events';

import 'core-js/actual/aggregate-error';

import type { SyncOrPromise } from '../types';

import { getDeferredPromise } from './deferredPromise';
import type { DeferredPromise } from './deferredPromise';

export class TaskSyncer extends EventEmitter {
  public readonly done: Promise<void>;

  private readonly deferredDone: DeferredPromise<void>;
  private readonly deferredReady: DeferredPromise<void>;
  private readonly name: string;
  private readonly number: number;
  private readonly parent?: TaskSyncer;
  private readonly tickets: TaskSyncer[] = [];
  private _ready: Promise<void>;
  private _status: 'done' | 'pending' | 'running' = 'pending';
  private currentTicket = 0;
  private isReady = false;
  private wasReady = false;

  public constructor (
    name?: string,
    parent?: TaskSyncer,
    number = 0
  ) {
    super();
    this.number = number;
    this.parent = parent;
    this.name = this.defineName(name);
    this.deferredDone = getDeferredPromise();
    this.done = this.deferredDone.promise;
    this.deferredReady = getDeferredPromise();
    this._ready = this.deferredReady.promise;

    this.setReadyTriggers();
    if (parent) parent.done.finally(() => { this.close(); }).catch(() => { /* do nothing */ });
  }

  public get ready (): Promise<void> {
    return this._ready.catch((reason: unknown) => {
      // Get the correct error.stack
      if (reason instanceof Error) throw new AggregateError([reason], reason.message);
      throw reason;
    });
  }

  public get status (): 'done' | 'pending' | 'running' {
    return this._status;
  }

  public close (): void {
    if (this._status === 'done') return;
    this._status = 'done';
    // set ready state
    this.isReady = false;
    const isDoneError = new Error(`The ticket "${this.name}" is already done.`);
    this.deferredReady.reject(isDoneError);
    this._ready = Promise.reject(isDoneError);
    this._ready.catch(() => { /* do nothing there */ });
    // fire done event and promise
    this.emit('done');
    this.deferredDone.resolve();
  }

  public async enqueue<U> (
    task: (syncer: TaskSyncer) => SyncOrPromise<U>, name?: string
  ): Promise<U> {
    const ticket = this.getTicket(name);
    await ticket.ready;
    return await Promise.resolve(task(ticket)).finally(() => { ticket.close(); });
  }

  public getName (): string {
    return this.name;
  }

  public getTicket (index?: string): TaskSyncer;
  public getTicket (index: number): TaskSyncer | undefined;
  public getTicket (index?: number | string): TaskSyncer | undefined {
    if (typeof index === 'number') return this.tickets[index];

    const number = this.tickets.length;
    const ticket = new TaskSyncer(index, this, number);

    this.tickets.push(ticket);
    ticket.once('ready', () => { this.currentTicket = number; });
    return ticket;
  }

  private async getReady (index: number): Promise<void> {
    await Promise.race([
      this.done.finally(() => { throw new Error('The syncer is already closed.'); }),
      Promise.allSettled(this.tickets.slice(0, index).map(async ticket => { await ticket.done; })),
    ]);
    await this.ready;
  }

  private defineName (name?: string): string {
    if (name) return this.parent ? `${this.parent.name}:${name}` : name;
    return this.parent ? `${this.parent.name}[${this.number}]` : 'root';
  }

  private resolveReady (): void {
    this.isReady = true;
    this.wasReady = true;
    this._status = 'running';
    this.emit('ready');
    this.deferredReady.resolve();
  }

  private setReadyTriggers (): void {
    this.deferredReady.promise.catch(() => { /* do nothing there */ });
    if (this.parent) {
      this.parent.getReady(this.number)
        .then(() => { this.resolveReady(); })
        .catch(reason => { this.deferredReady.reject(reason); });
    }
    else this.resolveReady();
  }
}
