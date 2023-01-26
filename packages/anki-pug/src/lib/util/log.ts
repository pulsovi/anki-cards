import { inspect } from 'util';

import debug from 'debug';

export const log = Object.assign(debug(`cdn-update:${process.pid}`), {
  depth (deep: number, ...args: unknown[]): void {
    Reflect.apply(log, null, args.map(arg => inspect(arg, false, deep, true)));
  },
});

export function stringError (error: unknown): string {
  const err = inspect(error, false, 10, true);
  if (!(error instanceof AggregateError)) return err;
  const children = error.errors.map(stringError).map(strErr => strErr.replace(/\n/gu, '\n|  '));
  return `${err}\n|--${children.join('\n|--')}`;
}
