#!/usr/bin/env node
import { program } from 'commander';
import debug from 'debug';

import { diff } from '../lib';
import { displayError } from '../lib/ErrorManager';
import type { AnkiPugConfig } from '../lib/getConfig';
import { rootLogger } from '../lib/util';

debug.enable('anki-pug*');
rootLogger('debug enabled from', __filename);

program
  .name('anki-pug');

program.command('diff', { isDefault: true })
  .option('-r|--root <path>', 'Path of the root directory that contains the models templates.')
  .description('(default) launch diff between your pug models and your html output')
  .action(async (parsedArgs: { root?: string }) => {
    const argv: Partial<AnkiPugConfig> = {};
    if (parsedArgs.root) argv.modelsPath = parsedArgs.root;
    await diff(argv);
  });

program
  .parseAsync(process.argv)
  .catch((error: unknown) => { displayError(error); });
