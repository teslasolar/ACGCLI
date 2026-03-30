'use strict';

const { execSync } = require('child_process');
const fs = require('fs');

exports.queryAI = function queryAI(config, prompt) {
  if (!prompt || !prompt.trim()) {
    console.log('Usage: acg ai "your question about this project"');
    return;
  }

  const aiConfig = config.ai || {};
  const provider = aiConfig.provider || 'local';

  // Build context from configured files
  const contextFiles = aiConfig.context_files || ['README.md', 'acg.yaml'];
  const context = contextFiles
    .filter((f) => fs.existsSync(f))
    .map((f) => `--- ${f} ---\n${fs.readFileSync(f, 'utf8').slice(0, 2000)}`)
    .join('\n\n');

  const systemPrompt = (aiConfig.system_prompt || 'You are a helpful assistant for this project.')
    .replace('{description}', config.description || config.name);

  const fullPrompt = `${systemPrompt}\n\nProject context:\n${context}\n\nUser: ${prompt}`;

  if (provider === 'local') {
    const model = aiConfig.model || 'phi3';
    try {
      const escaped = fullPrompt.replace(/'/g, "'\\''");
      const out = execSync(`echo '${escaped}' | ollama run ${model}`, {
        encoding: 'utf8',
        timeout: 60000,
      });
      console.log(out.trim());
    } catch {
      console.error('Ollama not available. Install from https://ollama.ai');
      console.error('Or set ai.provider to "anthropic" in acg.yaml');
    }
  } else if (provider === 'anthropic') {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      console.error('Set ANTHROPIC_API_KEY environment variable.');
      return;
    }
    const model = aiConfig.model || 'claude-sonnet-4-20250514';
    const body = JSON.stringify({
      model,
      max_tokens: 500,
      messages: [{ role: 'user', content: fullPrompt }],
    });
    try {
      const out = execSync(
        `curl -s https://api.anthropic.com/v1/messages -H "x-api-key: ${key}" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" -d '${body.replace(/'/g, "'\\''")}'`,
        { encoding: 'utf8', timeout: 30000 }
      );
      const resp = JSON.parse(out);
      console.log(resp.content?.[0]?.text || 'No response received.');
    } catch (e) {
      console.error(`API error: ${e.message}`);
    }
  } else if (provider === 'openai') {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      console.error('Set OPENAI_API_KEY environment variable.');
      return;
    }
    const model = aiConfig.model || 'gpt-4o-mini';
    const body = JSON.stringify({
      model,
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Project context:\n${context}\n\n${prompt}` },
      ],
    });
    try {
      const out = execSync(
        `curl -s https://api.openai.com/v1/chat/completions -H "Authorization: Bearer ${key}" -H "content-type: application/json" -d '${body.replace(/'/g, "'\\''")}'`,
        { encoding: 'utf8', timeout: 30000 }
      );
      const resp = JSON.parse(out);
      console.log(resp.choices?.[0]?.message?.content || 'No response received.');
    } catch (e) {
      console.error(`API error: ${e.message}`);
    }
  } else {
    console.error(`Unknown AI provider: ${provider}`);
  }
};
