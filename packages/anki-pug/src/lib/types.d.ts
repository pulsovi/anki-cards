/* eslint-disable @typescript-eslint/no-type-alias */
import type { AnkiPugConfig } from './getConfig';
import type { RawTemplate } from './Template';

type SyncOrPromise<T> = Promise<T> | T;
type SingleOrArray<T> = T | T[];
type DirectOrCallback<T> = T | ((config: AnkiPugConfig) => T);

declare type ModelModule = DirectOrCallback<SyncOrPromise<SingleOrArray<RawTemplate>>>;

declare interface DiffConfig {
  quit: boolean;
}
