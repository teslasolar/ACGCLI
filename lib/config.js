// 📐 KONOMI:ACG-JS-003 | tokens:~95 | scope:yaml config loader
'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

exports.loadConfig = function loadConfig() {
  const configPath = path.resolve('acg.yaml');
  if (!fs.existsSync(configPath)) {
    throw new Error('No acg.yaml found. Run: acg init');
  }
  const raw = fs.readFileSync(configPath, 'utf8');
  const config = yaml.load(raw);
  const required = ['name', 'runtime', 'commands'];
  for (const field of required) {
    if (!config[field]) {
      throw new Error(`acg.yaml missing required field: ${field}`);
    }
  }
  return config;
};
