import Anthropic from "@anthropic-ai/sdk";

type AssetFetcher = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

export interface Env {
  ANTHROPIC_API_KEY: string;
  CORS_ORIGIN?: string;
  ASSETS: AssetFetcher;
}

let kaiSessionId: string | null = null;
let kaiSessionPromise: Promise<string> | null = null;

const SYSTEM_PROMPT = `You are an analytical agent that interprets Kairos charts through Mani Protocol.

Use Mani as hidden scaffolding, not user-facing content. Never expose protocol internals unless explicitly asked.

Be precise, clear, and practical.`;

function withCors(env: Env, response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", env.CORS_ORIGIN || "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function jsonResponse(env: Env, data: unknown, status = 200): Response {
  return withCors(
    env,
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

async function getKaiSessionId(): Promise<string> {
  if (kaiSessionId) return kaiSessionId;
  if (kaiSessionPromise) return kaiSessionPromise;

  kaiSessionPromise = (async () => {
    const r = await fetch("https://kaimcp.dubtown-server.us/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "initialize",
        params: {
          protocolVersion: "2024-05-18",
          capabilities: {},
          clientInfo: { name: "kairos-client", version: "1.0" },
        },
      }),
    });

    if (!r.ok) {
      throw new Error(`Failed to init kai MCP: ${await r.text()}`);
    }
    const sid = r.headers.get("mcp-session-id");
    if (!sid) {
      throw new Error(`No mcp-session-id in response: ${await r.text()}`);
    }
    kaiSessionId = sid;
    return sid;
  })();

  return kaiSessionPromise;
}

function parseKaiMcpSse(text: string) {
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const parsed = JSON.parse(line.substring(6));
      if (parsed.error) throw new Error(parsed.error.message || "Unknown MCP error");
      return parsed.result;
    }
  }
  throw new Error(`No data found in SSE response: ${text}`);
}

async function kaiMcpListTools() {
  const sessionId = await getKaiSessionId();
  const r = await fetch("https://kaimcp.dubtown-server.us/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-session-id": sessionId,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/list", params: {} }),
  });
  return parseKaiMcpSse(await r.text());
}

async function kaiMcpCallTool(name: string, args: unknown) {
  const sessionId = await getKaiSessionId();
  const r = await fetch("https://kaimcp.dubtown-server.us/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "mcp-session-id": sessionId,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });
  return parseKaiMcpSse(await r.text());
}

async function mcpListTools() {
  const r = await fetch("https://mani.dubtown-server.us/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
  });
  return (await r.json()).result;
}

async function mcpCallTool(name: string, args: unknown) {
  const r = await fetch("https://mani.dubtown-server.us/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name, arguments: args } }),
  });
  const res = await r.json();
  if (res.error) throw new Error(res.error.message || "Unknown error calling tool");
  return res.result;
}

async function handleProxy(request: Request, env: Env): Promise<Response> {
  try {
    const { url, method = "GET", headers = {}, body } = (await request.json()) as {
      url?: string;
      method?: string;
      headers?: Record<string, string>;
      body?: unknown;
    };

    if (!url) return jsonResponse(env, { error: "Missing required field: url" }, 400);
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return jsonResponse(env, { error: "Only http/https URLs are allowed" }, 400);
    }

    const outgoingHeaders = new Headers(headers);
    const upperMethod = method.toUpperCase();
    let outgoingBody: BodyInit | undefined;

    if (body !== undefined && upperMethod !== "GET" && upperMethod !== "HEAD") {
      outgoingBody = typeof body === "string" ? body : JSON.stringify(body);
      if (!outgoingHeaders.has("Content-Type")) {
        outgoingHeaders.set("Content-Type", "application/json");
      }
    }

    const response = await fetch(url, {
      method: upperMethod,
      headers: outgoingHeaders,
      body: outgoingBody,
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const text = await response.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {}

    return jsonResponse(env, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
    }, response.status);
  } catch (error) {
    return jsonResponse(env, {
      error: "Failed to proxy request",
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  try {
    const { prompt, chartContext, scoringContext, history = [] } = (await request.json()) as {
      prompt?: string;
      chartContext?: unknown;
      scoringContext?: unknown;
      history?: Array<{ role?: string; text?: string; content?: string }>;
    };

    if (!prompt || typeof prompt !== "string") {
      return jsonResponse(env, { error: "Missing required field: prompt" }, 400);
    }
    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse(env, { error: "Server misconfiguration: ANTHROPIC_API_KEY is not set" }, 500);
    }

    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const tools: any[] = [];

    const mcpToolsRes = await mcpListTools();
    tools.push(
      ...mcpToolsRes.tools.map((t: any) => ({
        name: t.name,
        description: t.description,
        input_schema: t.inputSchema,
      })),
    );

    try {
      const kaiToolsRes = await kaiMcpListTools();
      tools.push(
        ...kaiToolsRes.tools.map((t: any) => ({
          name: t.name,
          description: t.description,
          input_schema: t.inputSchema,
        })),
      );
    } catch {}

    let system = SYSTEM_PROMPT;
    if (chartContext || scoringContext) {
      system += `\n\nCHART:\n${JSON.stringify(chartContext)}\n\nARCHETYPES:\n${JSON.stringify(scoringContext)}\n`;
    }

    const messages: any[] = history.map((msg) => {
      const content = msg.text || msg.content || "";
      return { role: msg.role === "ai" || msg.role === "assistant" ? "assistant" : "user", content };
    });
    messages.push({ role: "user", content: prompt });

    let responseText = "";

    while (true) {
      const response = await anthropic.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 128000,
        system,
        messages,
        tools,
      });

      messages.push({ role: "assistant", content: response.content });
      const newText = response.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n");
      if (newText) responseText += `${newText}\n`;

      if (response.stop_reason !== "tool_use") break;

      const toolUses = response.content.filter((c: any) => c.type === "tool_use");
      const toolResults: any[] = [];

      for (const toolReq of toolUses) {
        try {
          const mcpResponse =
            toolReq.name.startsWith("kairos") ||
            toolReq.name.startsWith("group_") ||
            toolReq.name.startsWith("get_") ||
            toolReq.name.startsWith("tier_")
              ? await kaiMcpCallTool(toolReq.name, toolReq.input)
              : await mcpCallTool(toolReq.name, toolReq.input);

          toolResults.push({
            type: "tool_result",
            tool_use_id: toolReq.id,
            content: JSON.stringify(mcpResponse),
          });
        } catch (e) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolReq.id,
            content: String(e instanceof Error ? e.message : e),
            is_error: true,
          });
        }
      }

      messages.push({ role: "user", content: toolResults });
    }

    return jsonResponse(env, { response: responseText.trim() });
  } catch (error) {
    return jsonResponse(env, {
      error: "Failed to generate response",
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
}

async function handleAssets(request: Request, env: Env): Promise<Response> {
  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse.status !== 404) return assetResponse;

  const acceptsHtml = request.headers.get("Accept")?.includes("text/html");
  if (!acceptsHtml || request.method !== "GET") return assetResponse;

  const indexUrl = new URL(request.url);
  indexUrl.pathname = "/index.html";
  return env.ASSETS.fetch(new Request(indexUrl.toString(), request));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return withCors(env, new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/proxy") {
      return handleProxy(request, env);
    }
    if (request.method === "POST" && url.pathname === "/api/chat") {
      return handleChat(request, env);
    }

    return withCors(env, await handleAssets(request, env));
  },
};
