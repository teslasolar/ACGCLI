// 📐 KONOMI:ACG-JS-014 | tokens:~130 | scope:scaffolder — acg init
'use strict';

const fs = require('fs');
const path = require('path');
const { runtimeTemplates, generateYaml } = require('./templates');

exports.scaffold = function scaffold() {
  if (fs.existsSync('acg.yaml')) {
    console.log('acg.yaml already exists. Edit it directly.');
    return;
  }

  const detectors = [
    ['package.json', 'node'],
    ['requirements.txt', 'python'],
    ['pyproject.toml', 'python'],
    ['Cargo.toml', 'rust'],
    ['go.mod', 'go'],
    ['index.html', 'static'],
  ];

  let runtime = 'python';
  for (const [file, lang] of detectors) {
    if (fs.existsSync(file)) { runtime = lang; break; }
  }

  const name = path.basename(process.cwd());
  const yaml = generateYaml(name, runtime);
  fs.writeFileSync('acg.yaml', yaml);
  console.log(`\u2692 Created acg.yaml for ${name} (${runtime})`);
  console.log('  Edit the file, then run: acg status');
};
