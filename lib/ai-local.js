// 📐 KONOMI:ACG-JS-010 | tokens:~75 | scope:AI provider — ollama/local
'use strict';

const { execSync } = require('child_process');

exports.aiLocal = function aiLocal(fullPrompt, model) {
  const m = model || 'phi3';
  try {
    const escaped = fullPrompt.replace(/'/g, "'\\''");
    const out = execSync(`echo '${escaped}' | ollama run ${m}`, {
      encoding: 'utf8',
      timeout: 60000,
    });
    console.log(out.trim());
  } catch {
    console.error('Ollama not available. Install from https://ollama.ai');
    console.error('Or set ai.provider to "anthropic" in acg.yaml');
  }
};
