<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy the app

This repo now supports:

- Local Node/Express development (`server.ts`)
- Cloudflare Worker + Pages-style static assets (`worker.ts` + `wrangler.toml`)

## Run locally (Node/Express)

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set `ANTHROPIC_API_KEY` in your environment (example: `export ANTHROPIC_API_KEY=your_key`)
3. Run: `npm run dev`

## Build static client assets

Build the SPA output used by Cloudflare assets:

`npm run build:client`

This creates `/dist` with `index.html` and frontend bundles.

## Deploy to Cloudflare Worker

1. Authenticate (first time): `npx wrangler login`
2. Ensure secrets are set:
   - `npx wrangler secret put ANTHROPIC_API_KEY`
3. Deploy:
   - `npm run deploy:worker`

## Worker routes

- `POST /api/chat` — Anthropic + MCP orchestration
- `POST /api/proxy` — upstream API proxy
- `GET /*` — static assets from `/dist` with SPA fallback to `/index.html`
