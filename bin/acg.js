#!/usr/bin/env node
// 📐 KONOMI:ACG-JS-001 | tokens:~160 | scope:CLI entry point + router
'use strict';

const { loadConfig } = require('../lib/config');
const { runCommand } = require('../lib/runner');
const { startAPI } = require('../lib/api');
const { startMCP } = require('../lib/mcp');
const { queryAI } = require('../lib/ai');
const { doctor } = require('../lib/doctor');
const { scaffold } = require('../lib/init');
const { showHelp } = require('../lib/help');

const args = process.argv.slice(2);
const cmd = args[0];

if (cmd === 'init') { scaffold(); process.exit(0); }
if (cmd === 'help' || cmd === '--help' || !cmd) { showHelp(); process.exit(0); }
if (cmd === 'version' || cmd === '--version') {
  console.log(`acg-cli v${require('../package.json').version}`);
  process.exit(0);
}

let config;
try { config = loadConfig(); } catch (e) { console.error(e.message); process.exit(1); }

const handlers = {
  run: () => runCommand(config.commands.run, args.slice(1)),
  test: () => runCommand(config.commands.test, args.slice(1)),
  build: () => runCommand(config.commands.build, args.slice(1)),
  deploy: () => runCommand(config.commands.deploy, args.slice(1)),
  lint: () => runCommand(config.commands.lint, args.slice(1)),
  clean: () => runCommand(config.commands.clean, args.slice(1)),
  dev: () => runCommand(config.commands.dev, args.slice(1)),
  status: () => doctor(config, { quick: true }),
  doctor: () => doctor(config, { full: true }),
  api: () => startAPI(config, args.slice(1)),
  mcp: () => startMCP(config),
  ai: () => queryAI(config, args.slice(1).join(' ')),
  ...Object.fromEntries(
    Object.entries(config.custom || {}).map(([k, v]) =>
      [k, () => runCommand(v, args.slice(1))]
    )
  ),
};

const handler = handlers[cmd];
if (handler) { handler(); }
else { console.error(`Unknown command: ${cmd}\nRun 'acg help' for available commands.`); process.exit(1); }
