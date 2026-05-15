import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Anthropic from "@anthropic-ai/sdk";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy Route to handle CORS when calling external ecosystem APIs
  app.post("/api/proxy", async (req, res) => {
    try {
      const { url, method = 'GET', headers = {}, body } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "Missing required field: url" });
      }

      console.log(`Proxying ${method} ${url}...`);

      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      if (body && method !== 'GET' && method !== 'HEAD') {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        if (!fetchOptions.headers['Content-Type']) {
          fetchOptions.headers['Content-Type'] = 'application/json';
        }
      }

      const response = await fetch(url, fetchOptions);
      
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const text = await response.text();
      let responseBody = text;
      try {
        responseBody = JSON.parse(text);
      } catch (e) {
        // It's just text
      }

      res.status(response.status).json({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseBody
      });
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ 
        error: "Failed to proxy request", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, chartContext, scoringContext } = req.body;
      
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const systemInstruction = `You are Mani, the AI assistant of the Paths of Reverence ecosystem. 
You act as an interface to the esoteric knowledge graphs and planetary charting systems.
When answering, rely heavily on the context provided about the user's astrological chart and tarot archetypes. 
Speak with an esoteric, insightful, but clear tone.`;

      let contextText = "";
      if (chartContext || scoringContext) {
        contextText = `Here is the system context currently loaded:\n\nCHART:\n${JSON.stringify(chartContext)}\n\nARCHETYPES:\n${JSON.stringify(scoringContext)}\n\n`;
      }

      const response = await anthropic.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 1024,
        system: systemInstruction,
        messages: [{
          role: "user",
          content: contextText + prompt
        }]
      });

      const responseText = response.content[0].type === "text" ? response.content[0].text : "";
      
      res.json({ response: responseText });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production asset serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
