'use strict';

const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');

exports.startAPI = function startAPI(config, args) {
  const subCmd = args[0];
  if (subCmd !== 'start') {
    console.log('Usage: acg api start');
    return;
  }

  const port = config.api?.port || 9000;
  const app = express();

  if (config.api?.cors !== false) {
    app.use(cors());
  }
  app.use(express.json());

  // Status & config endpoints
  app.get('/status', (_req, res) => {
    res.json({ name: config.name, version: config.version, status: 'ok' });
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy' });
  });

  app.get('/config', (_req, res) => {
    res.json(config);
  });

  // Auto-generate endpoints from commands + custom
  const allCmds = { ...config.commands, ...(config.custom || {}) };

  for (const [name, cmd] of Object.entries(allCmds)) {
    app.post(`/${name}`, (_req, res) => {
      try {
        const out = execSync(cmd.cmd, {
          encoding: 'utf8',
          timeout: 60000,
          env: { ...process.env },
        });
        res.json({ ok: true, command: name, output: out });
      } catch (e) {
        res.status(500).json({ ok: false, command: name, error: e.message });
      }
    });
  }

  // Logs endpoint
  app.get('/logs', (_req, res) => {
    try {
      const out = execSync('git log --oneline -20', { encoding: 'utf8' });
      res.json({ logs: out.trim().split('\n') });
    } catch {
      res.json({ logs: [] });
    }
  });

  app.listen(port, () => {
    console.log(`\u2692 ACG API server on :${port}`);
    console.log(`  GET  /status`);
    console.log(`  GET  /health`);
    console.log(`  GET  /config`);
    console.log(`  GET  /logs`);
    for (const name of Object.keys(allCmds)) {
      console.log(`  POST /${name}`);
    }
  });
};
