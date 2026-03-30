#!/usr/bin/env node
'use strict';

const { loadConfig } = require('../lib/config');
const { runCommand } = require('../lib/runner');
const { startAPI } = require('../lib/api');
const { startMCP } = require('../lib/mcp');
const { queryAI } = require('../lib/ai');
const { doctor } = require('../lib/doctor');
const { scaffold } = require('../lib/init');

const args = process.argv.slice(2);
const cmd = args[0];

// Init doesn't need config
if (cmd === 'init') {
  scaffold();
  process.exit(0);
}

if (cmd === 'help' || cmd === '--help' || !cmd) {
  showHelp();
  process.exit(0);
}

if (cmd === 'version' || cmd === '--version') {
  const pkg = require('../package.json');
  console.log(`acg-cli v${pkg.version}`);
  process.exit(0);
}

let config;
try {
  config = loadConfig();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const handlers = {
  // Core commands from acg.yaml
  run:    () => runCommand(config.commands.run, args.slice(1)),
  test:   () => runCommand(config.commands.test, args.slice(1)),
  build:  () => runCommand(config.commands.build, args.slice(1)),
  deploy: () => runCommand(config.commands.deploy, args.slice(1)),
  lint:   () => runCommand(config.commands.lint, args.slice(1)),
  clean:  () => runCommand(config.commands.clean, args.slice(1)),
  dev:    () => runCommand(config.commands.dev, args.slice(1)),

  // Meta commands
  status: () => doctor(config, { quick: true }),
  doctor: () => doctor(config, { full: true }),

  // Layers
  api:    () => startAPI(config, args.slice(1)),
  mcp:    () => startMCP(config),
  ai:     () => queryAI(config, args.slice(1).join(' ')),

  // Custom commands from acg.yaml
  ...Object.fromEntries(
    Object.entries(config.custom || {}).map(([k, v]) =>
      [k, () => runCommand(v, args.slice(1))]
    )
  ),
};

const handler = handlers[cmd];
if (handler) {
  handler();
} else {
  console.error(`Unknown command: ${cmd}`);
  console.error(`Run 'acg help' for available commands.`);
  process.exit(1);
}

function showHelp() {
  const chalk = require('chalk');
  console.log(chalk.bold('\n  acg') + ' — universal repo CLI wrapper\n');
  console.log('  Usage: acg <command> [options]\n');
  console.log('  Commands:');
  console.log('    init          Scaffold acg.yaml for this repo');
  console.log('    run           Start the application');
  console.log('    test          Run tests');
  console.log('    build         Build the project');
  console.log('    deploy        Deploy (with confirmation)');
  console.log('    lint          Lint source code');
  console.log('    clean         Clean build artifacts');
  console.log('    dev           Start in dev mode');
  console.log('    status        Quick health check');
  console.log('    doctor        Full health check');
  console.log('    api start     Start HTTP API server');
  console.log('    mcp start     Start MCP server (stdio)');
  console.log('    ai <prompt>   Ask AI about the project');
  console.log('    help          Show this help');
  console.log('    version       Show version');

  try {
    const config = loadConfig();
    const custom = Object.keys(config.custom || {});
    if (custom.length) {
      console.log('\n  Custom commands:');
      for (const name of custom) {
        const desc = config.custom[name].description || '';
        console.log(`    ${name.padEnd(14)}${desc}`);
      }
    }
  } catch {
    // No config, skip custom commands
  }

  console.log('');
}
