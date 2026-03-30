// 📐 KONOMI:ACG-JS-008 | tokens:~230 | scope:MCP tool call handlers
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const text = (t) => ({ content: [{ type: 'text', text: t }] });
const err = (t) => ({ content: [{ type: 'text', text: t }], isError: true });

exports.handleToolCall = function handleToolCall(params, allCmds, extraTools) {
  const { name, arguments: args } = params;
  try {
    if (name === 'acg_read_file') {
      return text(fs.readFileSync(path.resolve(args.path), 'utf8'));
    }
    if (name === 'acg_write_file') {
      const p = path.resolve(args.path);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, args.content);
      return text(`Wrote ${args.path}`);
    }
    if (name === 'acg_search') {
      const out = execSync(
        `grep -r ${JSON.stringify(args.query)} --include="*.py" --include="*.js" --include="*.ts" --include="*.md" --include="*.yaml" -l . 2>/dev/null || true`,
        { encoding: 'utf8' });
      return text(out || 'No matches');
    }
    if (name === 'acg_git_status') return text(execSync('git status --short', { encoding: 'utf8' }) || 'Clean');
    if (name === 'acg_git_diff') return text(execSync('git diff --stat', { encoding: 'utf8' }) || 'No changes');
    if (name === 'acg_logs') return text(execSync(`git log --oneline -${args?.lines || 20}`, { encoding: 'utf8' }));

    const cmdName = name.replace('acg_', '');
    const cmd = allCmds[cmdName];
    if (cmd) {
      const full = args?.args ? `${cmd.cmd} ${args.args}` : cmd.cmd;
      return text(execSync(full, { encoding: 'utf8', timeout: 60000 }));
    }
    const extra = extraTools.find((t) => t.name === name);
    if (extra) {
      let c = extra.cmd;
      for (const [k, v] of Object.entries(args || {})) { c = c.replace(`{${k}}`, String(v)); }
      return text(execSync(c, { encoding: 'utf8', timeout: 60000 }));
    }
    return err(`Unknown tool: ${name}`);
  } catch (e) { return err(`Error: ${e.message}`); }
};
