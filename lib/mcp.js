'use strict';

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

exports.startMCP = function startMCP(config) {
  const serverName = config.mcp?.name || `${config.name}-mcp`;

  const server = new Server(
    { name: serverName, version: config.version || '1.0.0' },
    { capabilities: { tools: {} } }
  );

  const allCmds = { ...config.commands, ...(config.custom || {}) };

  // Build tools list from commands
  const tools = Object.entries(allCmds).map(([name, cmd]) => ({
    name: `acg_${name}`,
    description: cmd.description || `Run ${name}`,
    inputSchema: {
      type: 'object',
      properties: { args: { type: 'string', description: 'Additional arguments' } },
    },
  }));

  // Filesystem & git tools
  tools.push(
    {
      name: 'acg_read_file',
      description: 'Read a file from the repo',
      inputSchema: {
        type: 'object',
        properties: { path: { type: 'string', description: 'File path relative to repo root' } },
        required: ['path'],
      },
    },
    {
      name: 'acg_write_file',
      description: 'Write content to a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relative to repo root' },
          content: { type: 'string', description: 'File content' },
        },
        required: ['path', 'content'],
      },
    },
    {
      name: 'acg_search',
      description: 'Search for text across repo files',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Search query' } },
        required: ['query'],
      },
    },
    {
      name: 'acg_git_status',
      description: 'Show git status',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'acg_git_diff',
      description: 'Show git diff summary',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'acg_logs',
      description: 'Show recent git log',
      inputSchema: {
        type: 'object',
        properties: { lines: { type: 'number', description: 'Number of log lines (default 20)' } },
      },
    }
  );

  // Extra tools from mcp config
  const extraTools = config.mcp?.extra_tools || [];
  for (const t of extraTools) {
    tools.push({
      name: t.name,
      description: t.description,
      inputSchema: {
        type: 'object',
        properties: Object.fromEntries(
          Object.entries(t.params || {}).map(([k, v]) => [k, { type: v }])
        ),
      },
    });
  }

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      // Filesystem tools
      if (name === 'acg_read_file') {
        const filePath = path.resolve(args.path);
        const content = fs.readFileSync(filePath, 'utf8');
        return { content: [{ type: 'text', text: content }] };
      }

      if (name === 'acg_write_file') {
        const filePath = path.resolve(args.path);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, args.content);
        return { content: [{ type: 'text', text: `Wrote ${args.path}` }] };
      }

      if (name === 'acg_search') {
        const out = execSync(
          `grep -r ${JSON.stringify(args.query)} --include="*.py" --include="*.js" --include="*.ts" --include="*.md" --include="*.yaml" --include="*.yml" -l . 2>/dev/null || true`,
          { encoding: 'utf8' }
        );
        return { content: [{ type: 'text', text: out || 'No matches found' }] };
      }

      if (name === 'acg_git_status') {
        const out = execSync('git status --short', { encoding: 'utf8' });
        return { content: [{ type: 'text', text: out || 'Clean working tree' }] };
      }

      if (name === 'acg_git_diff') {
        const out = execSync('git diff --stat', { encoding: 'utf8' });
        return { content: [{ type: 'text', text: out || 'No changes' }] };
      }

      if (name === 'acg_logs') {
        const n = args?.lines || 20;
        const out = execSync(`git log --oneline -${n}`, { encoding: 'utf8' });
        return { content: [{ type: 'text', text: out }] };
      }

      // Command tools
      const cmdName = name.replace('acg_', '');
      const cmd = allCmds[cmdName];
      if (cmd) {
        const full = args?.args ? `${cmd.cmd} ${args.args}` : cmd.cmd;
        const out = execSync(full, { encoding: 'utf8', timeout: 60000 });
        return { content: [{ type: 'text', text: out }] };
      }

      // Extra tools
      const extra = extraTools.find((t) => t.name === name);
      if (extra) {
        let c = extra.cmd;
        for (const [k, v] of Object.entries(args || {})) {
          c = c.replace(`{${k}}`, String(v));
        }
        const out = execSync(c, { encoding: 'utf8', timeout: 60000 });
        return { content: [{ type: 'text', text: out }] };
      }

      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  });

  const transport = new StdioServerTransport();
  server.connect(transport);
  console.error(`\u2692 ACG MCP server running: ${tools.length} tools`);
};
