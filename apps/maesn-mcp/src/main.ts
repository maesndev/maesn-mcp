import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { toolPaths } from './toolpaths.js';

const server = new Server(
  {
    name: 'maesn-mcp',
    version: '1.0.0',
    description: 'MCP server for maesn UAPI',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

async function loadTools() {
  const tools = [] as any[];
  for (const toolPath of toolPaths) {
    const module = await import(`${toolPath}`);
    const tool = module.apiTool;
    tools.push(tool);
  }
  return tools;
}

async function main() {
  const tools = await loadTools();

  // Define all tools for the server
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description || '',
      inputSchema: zodToJsonSchema(tool.input),
    })),
  }));

  // Define tool functions
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const toolName = req.params.name;
    const tool = tools.find((t) => t.name === toolName);
    if (!tool) throw new Error(`Tool not found locally: ${toolName}`);
    const args = req.params.arguments;
    const parsed = tool.input.parse(args);
    const result = await tool.run(parsed);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running...');
  console.error('API key from env: ', process.env.API_KEY)
  console.error('account key from env: ', process.env.ACCOUNT_KEY);

}

main().catch(console.error);
