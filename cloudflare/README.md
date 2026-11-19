# CENTRAL IA — Cloudflare Worker foundation

This folder contains the first, deliberately limited backend scaffold.

## What it does now

- Exposes a read-only `/health` and `/api/status` endpoint.
- Includes a Cloudflare Cron Trigger scheduled every six hours.
- Restricts browser requests to the published CENTRAL IA GitHub Pages origin.
- Makes it explicit in its status response that AI tasks and push delivery are not active.

## Deploy

1. Sign in to the Cloudflare dashboard.
2. Open **Workers & Pages** and create a Worker named `central-ia-api`.
3. Deploy the contents of `worker.js` as the Worker entry point, or connect this repository using Cloudflare's Git integration and set the Worker directory to `cloudflare`.
4. Ensure the Cron Trigger from `wrangler.toml` is present: `0 */6 * * *`.
5. After deployment, open the Worker URL followed by `/health`. A JSON response with `"ok": true` confirms the basic runtime is reachable.

## Important limitations

This scaffold is not an autonomous AI agent and does not send push notifications yet. Before enabling those features, the project needs authenticated task APIs, durable storage, a review/approval queue, push subscription storage, VAPID keys, and an AI provider secret. Store all secrets in Cloudflare Worker Secrets; never put them in the public website or GitHub source.

The scheduled handler currently writes only a heartbeat log. It does not publish content, access external accounts, spend money, or execute financial transactions.
