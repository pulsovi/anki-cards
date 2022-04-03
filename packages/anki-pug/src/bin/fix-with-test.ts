#!/usr/bin/env node
/* eslint-disable no-console, no-process-exit */
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

import chalk from 'chalk';
import { program } from 'commander';
import fs from 'fs-extra';

program
  .name('commit-msg');

program
  .argument('<commit-msg-file>', 'Path of the file contains the commit message.')
  .description('Ensures that a commit whose message begins with "fix: " will have at least one test that FAILs before the commit and PASSes after')
  .action(async (commitMsgFile: string) => {
    const gitRoot = await cmdOut('git rev-parse --show-toplevel');
    const message = await fs.readFile(path.join(gitRoot, commitMsgFile), 'utf8');

    if (!message.startsWith('fix')) {
      console.log('The commit is not a fix, exit OK');
      return;
    }

    const status = await cmdOut('git status --porcelain');
    const filesCommited = status.split('\n')
      .filter(line => line.startsWith('A') || line.startsWith('M'))
      .map(line => line.slice(3));
    const testAddedFiles = filesCommited.filter(filename => filename.endsWith('.test.ts'));

    if (!testAddedFiles.length) {
      console.log('No test file added nore modified');
      throw new Error('fix commits MUST add at least one test that fail before the commit');
    }

    console.log('fix commit', testAddedFiles.length, 'tests files found');
    await cmdOut('git stash -uq');
    const stashHash = await cmdOut('git rev-parse stash@{0}');
    const stashIndexHash = await cmdOut('git rev-parse "stash@{0}^2"');

    await cmdOut(`git checkout ${stashIndexHash} -- ${
      testAddedFiles
        .map(file => `"${path.relative(process.cwd(), path.join(gitRoot, file))}"`)
        .join(' ')
    }`);
    const jest = await cmdOut('yarn jest --bail').then(
      value => ({ error: null, value }),
      (error: unknown) => ({ error, value: null })
    );
    // Les tests doivent ÉCHOUER à ce stade (avant le commit)
    if (jest.value) console.log('FAIL'); else console.log('SUCCESS');
    // inutile de vérifier que les tests passent après le commit, lint-staged s'en charge
    await cmdOut('git reset --hard');
    await cmdOut(`git stash apply --quiet --index ${stashHash}`);
    if (await cmdOut('git rev-parse stash@{0}') === stashHash)
      await cmdOut('git stash drop stash@{0}');
    if (jest.value) {
      console.log('FAIL: fix commits MUST add at least one test that fail before the commit, all this tests pass');
      process.exit(1);
    }
  });

program
  .parseAsync(process.argv)
  .catch((error: unknown) => {
    console.log('===============================================');
    if (error instanceof Error) {
      console.log(`${chalk.red(error.name)}: ${chalk.yellow(error.message)}`);
      console.log(error.stack?.split('\n').slice(1).join('\n'));
    }
    else
      console.log(error);
    console.log('===============================================');
    process.exit(1);
  });

async function cmdOut (cmd: string): Promise<string> {
  return (await promisify(exec)(cmd)).stdout.slice(0, -1);
}
