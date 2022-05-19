import { resolve } from 'path';

import { Command } from 'commander';

const commander = new Command();

export const execute = async (): Promise<void> => {
  commander.command('test').action(async () => {
    console.info(`test`);
  });

  commander.parse(process.argv);
};
