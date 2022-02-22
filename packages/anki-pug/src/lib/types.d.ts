/* eslint-disable @typescript-eslint/no-type-alias */
import type { compileTemplate } from 'pug';

import type { AnkiPugConfig } from './getConfig';

type SyncOrPromise<T> = Promise<T> | T;
type SingleOrArray<T> = T | T[];
type DirectOrCallback<T> = T | ((config: AnkiPugConfig) => T);

declare interface RawTemplate {
  name: string;
  pugFile: string;
  template?: compileTemplate;
  locals?: Record<string, string>;
  htmlFile: string;
}

declare type ModelModule = DirectOrCallback<SyncOrPromise<SingleOrArray<RawTemplate>>>;

declare interface DiffConfig {
  quit: boolean;
}
