// 📐 KONOMI:ACG-JS-004 | tokens:~170 | scope:command executor
'use strict';

const { execSync } = require('child_process');
const chalk = require('chalk');

exports.runCommand = function runCommand(cmdConfig, extraArgs = []) {
  if (!cmdConfig) {
    console.error('Unknown command. Check acg.yaml.');
    process.exit(1);
  }
  if (cmdConfig.confirm && !extraArgs.includes('--yes')) {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(
      chalk.yellow(`\u26a0  ${cmdConfig.description || 'Confirm'}. Continue? [y/N] `),
      (answer) => {
        rl.close();
        if (answer.toLowerCase() !== 'y') { console.log('Aborted.'); return; }
        run(cmdConfig, extraArgs);
      }
    );
    return;
  }
  run(cmdConfig, extraArgs);
};

function run(cmdConfig, args) {
  const full = `${cmdConfig.cmd} ${args.join(' ')}`.trim();
  console.log(chalk.dim(`\u2692 ${full}`));
  const start = Date.now();
  const env = { ...process.env };
  if (cmdConfig.env) { env.NODE_ENV = cmdConfig.env; }
  try {
    execSync(full, { stdio: 'inherit', env });
    console.log(chalk.green(`\u2713 done in ${Date.now() - start}ms`));
  } catch (e) {
    console.error(chalk.red(`\u2717 failed (exit ${e.status || 1})`));
    process.exit(e.status || 1);
  }
}
