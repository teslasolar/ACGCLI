// 📐 KONOMI:ACG-JS-013 | tokens:~175 | scope:health check system
'use strict';

const { execSync } = require('child_process');
const chalk = require('chalk');

exports.doctor = function doctor(config, opts = {}) {
  console.log(chalk.bold(`\n  \u2692 ${config.name} \u2014 health check\n`));
  let passed = 0, failed = 0;

  function check(name, fn) {
    try {
      if (fn()) { console.log(chalk.green(`  \u2713 ${name}`)); passed++; }
      else { console.log(chalk.red(`  \u2717 ${name}`)); failed++; }
    } catch { console.log(chalk.red(`  \u2717 ${name}`)); failed++; }
  }

  check('acg.yaml valid', () => !!config.name);
  check('git repo', () => { execSync('git status', { stdio: 'ignore' }); return true; });
  check('commands defined', () => Object.keys(config.commands || {}).length > 0);
  check('runtime specified', () => !!config.runtime?.language);

  if (opts.full || !opts.quick) {
    for (const hc of (config.health || [])) {
      check(hc.name, () => {
        const out = execSync(hc.check, { encoding: 'utf8', timeout: 10000 }).trim();
        return !hc.expect || out.includes(hc.expect);
      });
    }
  }

  console.log(`\n  ${chalk.green(passed + ' passed')} \u00b7 ${
    failed ? chalk.red(failed + ' failed') : chalk.dim('0 failed')}\n`);
  return { passed, failed };
};
