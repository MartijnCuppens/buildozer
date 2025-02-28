#!/usr/bin/env node

const {exec} = require('child_process');
const chalk = require('chalk');

const tests = ['npm run fail-stylelint', 'npm run fail-eslint'];

tests.forEach(test => {
  exec(test, error => {
    if (!error) {
      throw new Error(`\`${test}\` should fail but doesn’t.`);
    }

    console.log(`${chalk.green('✓')}  Failtest \`${test}\` succeeded.`);
  });
});
