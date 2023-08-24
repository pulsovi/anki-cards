#!/usr/bin/env node
import { program } from 'commander';
import debug from 'debug';

import { displayError } from '../lib/ErrorManager';
import { rootLogger } from '../lib/util';

import type { AnkiPugConfig } from './diff-command';
import { diff } from './diff-command';
import { test } from './test-command';
import type { AnkiPugTestConfig } from './test-command';

debug.enable('anki-pug*');
rootLogger('debug enabled from', __filename);

program
  .name('anki-pug');

program.command('diff', { isDefault: true })
  .description('(default) launch diff between your pug models and your html output')
  .option('-r|--root <path>', 'The directory which contains the models templates — the pug files.')
  .action(async (parsedArgs: { root?: string }) => {
    const argv: Partial<AnkiPugConfig> = {};
    if (parsedArgs.root) argv.modelsPath = parsedArgs.root;
    await diff(argv);
  });

program.command('test')
  .description('launch tests for your pug models')
  .option('-m|--model-dir <path>', 'The directory which contains the models templates — the pug files.')
  .option('-d|--directory <path>', 'The folder in which to store the test files, default <model-dir>/../tests/ .')
  .action(async (parsedArgs: { modelDir?: string; directory?: string }) => {
    const argv: Partial<AnkiPugTestConfig> = {};
    if (parsedArgs.modelDir) argv.modelsPath = parsedArgs.modelDir;
    if (parsedArgs.directory) argv.testsPath = parsedArgs.directory;
    await test(argv);
  });

program
  .parseAsync(process.argv)
  .catch((error: unknown) => { displayError(error); });
