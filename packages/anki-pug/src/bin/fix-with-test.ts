#!/usr/bin/env node
/* eslint-disable no-console, no-process-exit */
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

import chalk from 'chalk';
import { program } from 'commander';
import fs from 'fs-extra';

import { todo } from '../lib/util';

program
  .name('commit-msg');

program
  .argument('<commit-msg-file>', 'Path of the file contains the commit message.')
  .description('Ensures that a commit whose message begins with "fix: " will have at least one test that FAILs before the commit and PASSes after')
  .action(async (commitMsgFile: string) => {
    const gitRoot = await cmdOut('git rev-parse --show-toplevel');
    const message = await fs.readFile(path.join(gitRoot, commitMsgFile), 'utf8');

    if (!message.startsWith('fix:')) return;

    const status = await cmdOut('git status --porcelain');
    const filesCommited = status.split('\n')
      .filter(line => line.startsWith('A') || line.startsWith('M'))
      .map(line => line.slice(3));
    const testAddedFiles = filesCommited.filter(filename => filename.endsWith('.test.ts'));

    if (!testAddedFiles.length)
      throw new Error('Le commit est de type "fix: " il DOIT ajouter un test.');

    // inutile de vérifier que les tests ajoutés passent après le commit, lint-staged s'en charge
    todo('Verifier que le/les tests ajoutés échouent avant le commit');
    // const currentCommit = await cmdOut('git rev-parse --verify --short HEAD');
  });

program
  .parseAsync(process.argv)
  .catch((error: unknown) => {
    console.log('===============================================');
    if (error instanceof Error)
      console.log(`${chalk.red(error.name)}: ${chalk.yellow(error.message)}`);
    else
      console.log(error);
    console.log('===============================================');
    process.exit(1);
  });

async function cmdOut (cmd: string): Promise<string> {
  return (await promisify(exec)(cmd)).stdout.trim();
}
