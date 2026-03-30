// 📐 KONOMI:ACG-JS-011 | tokens:~100 | scope:AI provider — Anthropic/Claude
'use strict';

const { execSync } = require('child_process');

exports.aiAnthropic = function aiAnthropic(fullPrompt, model) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { console.error('Set ANTHROPIC_API_KEY environment variable.'); return; }
  const m = model || 'claude-sonnet-4-20250514';
  const body = JSON.stringify({
    model: m,
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
  } catch (e) { console.error(`API error: ${e.message}`); }
};
