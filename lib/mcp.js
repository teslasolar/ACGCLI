// 📐 KONOMI:ACG-JS-006 | tokens:~150 | scope:MCP server setup
'use strict';

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { buildTools } = require('./mcp-tools');
const { handleToolCall } = require('./mcp-handlers');

exports.startMCP = function startMCP(config) {
  const serverName = config.mcp?.name || `${config.name}-mcp`;
  const server = new Server(
    { name: serverName, version: config.version || '1.0.0' },
    { capabilities: { tools: {} } }
  );

  const allCmds = { ...config.commands, ...(config.custom || {}) };
  const extraTools = config.mcp?.extra_tools || [];
  const tools = buildTools(allCmds, extraTools);

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return handleToolCall(request.params, allCmds, extraTools);
  });

  const transport = new StdioServerTransport();
  server.connect(transport);
  console.error(`\u2692 ACG MCP server running: ${tools.length} tools`);
};
