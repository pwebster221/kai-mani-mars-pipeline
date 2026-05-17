import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import * as es from "eventsource";
const EventSource = es.default || es;
(globalThis as any).EventSource = EventSource;

async function test() {
  const transport = new SSEClientTransport(new URL('https://kaimcp.dubtown-server.us/mcp'));
  const mcpClient = new Client({ name: 'kairos-client', version: '1.0' }, { capabilities: {} });
  await mcpClient.connect(transport);
  
  const mcpToolsRes = await mcpClient.listTools();
  console.log("Tools:", Object.keys(mcpToolsRes.tools));
  process.exit(0);
}
test().catch(console.error);
