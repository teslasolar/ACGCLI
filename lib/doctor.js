'use strict';

const { execSync } = require('child_process');
const chalk = require('chalk');

exports.doctor = function doctor(config, opts = {}) {
  console.log(chalk.bold(`\n  \u2692 ${config.name} \u2014 health check\n`));

  let passed = 0;
  let failed = 0;

  function check(name, fn) {
    try {
      if (fn()) {
        console.log(chalk.green(`  \u2713 ${name}`));
        passed++;
      } else {
        console.log(chalk.red(`  \u2717 ${name}`));
        failed++;
      }
    } catch {
      console.log(chalk.red(`  \u2717 ${name}`));
      failed++;
    }
  }

  // Quick checks always run
  check('acg.yaml valid', () => !!config.name);
  check('git repo', () => {
    execSync('git status', { stdio: 'ignore' });
    return true;
  });
  check('commands defined', () => Object.keys(config.commands || {}).length > 0);
  check('runtime specified', () => !!config.runtime?.language);

  // Full checks from health section
  if (opts.full || !opts.quick) {
    const healthChecks = config.health || [];
    for (const hc of healthChecks) {
      check(hc.name, () => {
        const out = execSync(hc.check, { encoding: 'utf8', timeout: 10000 }).trim();
        if (hc.expect) {
          return out.includes(hc.expect);
        }
        return true;
      });
    }
  }

  console.log(
    `\n  ${chalk.green(passed + ' passed')} \u00b7 ${
      failed ? chalk.red(failed + ' failed') : chalk.dim('0 failed')
    }\n`
  );

  return { passed, failed };
};
