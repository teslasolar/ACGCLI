// 📐 KONOMI:ACG-JS-005 | tokens:~200 | scope:HTTP API server
'use strict';

const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');

exports.startAPI = function startAPI(config, args) {
  if (args[0] !== 'start') { console.log('Usage: acg api start'); return; }
  const port = config.api?.port || 9000;
  const app = express();
  if (config.api?.cors !== false) { app.use(cors()); }
  app.use(express.json());

  app.get('/status', (_req, res) => {
    res.json({ name: config.name, version: config.version, status: 'ok' });
  });
  app.get('/health', (_req, res) => res.json({ status: 'healthy' }));
  app.get('/config', (_req, res) => res.json(config));
  app.get('/logs', (_req, res) => {
    try {
      const out = execSync('git log --oneline -20', { encoding: 'utf8' });
      res.json({ logs: out.trim().split('\n') });
    } catch { res.json({ logs: [] }); }
  });

  const allCmds = { ...config.commands, ...(config.custom || {}) };
  for (const [name, cmd] of Object.entries(allCmds)) {
    app.post(`/${name}`, (_req, res) => {
      try {
        const out = execSync(cmd.cmd, { encoding: 'utf8', timeout: 60000 });
        res.json({ ok: true, command: name, output: out });
      } catch (e) {
        res.status(500).json({ ok: false, command: name, error: e.message });
      }
    });
  }

  app.listen(port, () => {
    console.log(`\u2692 ACG API on :${port}`);
    console.log(`  GET  /status /health /config /logs`);
    for (const n of Object.keys(allCmds)) { console.log(`  POST /${n}`); }
  });
};
