// 📐 KONOMI:ACG-JS-009 | tokens:~140 | scope:AI query router + context
'use strict';

const fs = require('fs');
const { aiLocal } = require('./ai-local');
const { aiAnthropic } = require('./ai-anthropic');
const { aiOpenai } = require('./ai-openai');

exports.queryAI = function queryAI(config, prompt) {
  if (!prompt || !prompt.trim()) {
    console.log('Usage: acg ai "your question about this project"');
    return;
  }
  const aiConfig = config.ai || {};
  const provider = aiConfig.provider || 'local';

  const contextFiles = aiConfig.context_files || ['README.md', 'acg.yaml'];
  const context = contextFiles
    .filter((f) => fs.existsSync(f))
    .map((f) => `--- ${f} ---\n${fs.readFileSync(f, 'utf8').slice(0, 2000)}`)
    .join('\n\n');

  const systemPrompt = (aiConfig.system_prompt || 'You are a helpful assistant for this project.')
    .replace('{description}', config.description || config.name);

  const fullPrompt = `${systemPrompt}\n\nProject context:\n${context}\n\nUser: ${prompt}`;
  const model = aiConfig.model;

  const providers = { local: aiLocal, anthropic: aiAnthropic, openai: aiOpenai };
  const fn = providers[provider];
  if (fn) { fn(fullPrompt, model); }
  else { console.error(`Unknown AI provider: ${provider}`); }
};
