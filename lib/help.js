// 📐 KONOMI:ACG-JS-002 | tokens:~170 | scope:help display
'use strict';

const chalk = require('chalk');

exports.showHelp = function showHelp() {
  console.log(chalk.bold('\n  acg') + ' \u2014 universal repo CLI wrapper\n');
  console.log('  Usage: acg <command> [options]\n');
  console.log('  Commands:');
  const cmds = [
    ['init', 'Scaffold acg.yaml for this repo'],
    ['run', 'Start the application'],
    ['test', 'Run tests'],
    ['build', 'Build the project'],
    ['deploy', 'Deploy (with confirmation)'],
    ['lint', 'Lint source code'],
    ['clean', 'Clean build artifacts'],
    ['dev', 'Start in dev mode'],
    ['status', 'Quick health check'],
    ['doctor', 'Full health check'],
    ['api start', 'Start HTTP API server'],
    ['mcp start', 'Start MCP server (stdio)'],
    ['ai <prompt>', 'Ask AI about the project'],
    ['help', 'Show this help'],
    ['version', 'Show version'],
  ];
  for (const [name, desc] of cmds) {
    console.log(`    ${name.padEnd(14)}${desc}`);
  }
  try {
    const { loadConfig } = require('./config');
    const config = loadConfig();
    const custom = Object.keys(config.custom || {});
    if (custom.length) {
      console.log('\n  Custom commands:');
      for (const n of custom) {
        console.log(`    ${n.padEnd(14)}${config.custom[n].description || ''}`);
      }
    }
  } catch { /* no config */ }
  console.log('');
};
