import debug from 'debug';

import { getPackageName } from './getPackageName';

export const rootLogger = debug(getPackageName());

const subLoggers: Record<string, debug.Debugger> = {};

export function getLogger (subName: string): debug.Debugger {
  if (!(subName in subLoggers))
    subLoggers[subName] = rootLogger.extend(subName);
  return subLoggers[subName];
}
