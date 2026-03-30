// 📐 KONOMI:ACG-JS-007 | tokens:~200 | scope:MCP tool definitions builder
'use strict';

exports.buildTools = function buildTools(allCmds, extraTools) {
  const tools = Object.entries(allCmds).map(([name, cmd]) => ({
    name: `acg_${name}`,
    description: cmd.description || `Run ${name}`,
    inputSchema: { type: 'object', properties: { args: { type: 'string' } } },
  }));

  tools.push(
    { name: 'acg_read_file', description: 'Read a file',
      inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
    { name: 'acg_write_file', description: 'Write a file',
      inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } },
    { name: 'acg_search', description: 'Search repo files',
      inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
    { name: 'acg_git_status', description: 'Git status',
      inputSchema: { type: 'object', properties: {} } },
    { name: 'acg_git_diff', description: 'Git diff summary',
      inputSchema: { type: 'object', properties: {} } },
    { name: 'acg_logs', description: 'Recent git log',
      inputSchema: { type: 'object', properties: { lines: { type: 'number' } } } },
  );

  for (const t of extraTools) {
    tools.push({ name: t.name, description: t.description,
      inputSchema: { type: 'object', properties: Object.fromEntries(
        Object.entries(t.params || {}).map(([k, v]) => [k, { type: v }])
      ) },
    });
  }

  return tools;
};
