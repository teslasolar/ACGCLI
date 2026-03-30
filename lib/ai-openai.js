// 📐 KONOMI:ACG-JS-012 | tokens:~110 | scope:AI provider — OpenAI
'use strict';

const { execSync } = require('child_process');

exports.aiOpenai = function aiOpenai(fullPrompt, model) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) { console.error('Set OPENAI_API_KEY environment variable.'); return; }
  const m = model || 'gpt-4o-mini';
  const body = JSON.stringify({
    model: m,
    max_tokens: 500,
    messages: [{ role: 'user', content: fullPrompt }],
  });
  try {
    const out = execSync(
      `curl -s https://api.openai.com/v1/chat/completions -H "Authorization: Bearer ${key}" -H "content-type: application/json" -d '${body.replace(/'/g, "'\\''")}'`,
      { encoding: 'utf8', timeout: 30000 }
    );
    const resp = JSON.parse(out);
    console.log(resp.choices?.[0]?.message?.content || 'No response received.');
  } catch (e) { console.error(`API error: ${e.message}`); }
};
