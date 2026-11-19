const SITE_ORIGIN = "https://adryanruan2207.github.io";

function json(data, status = 200, origin = SITE_ORIGIN) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
      "cache-control": "no-store"
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (origin && origin !== SITE_ORIGIN) {
      return new Response("Origin not allowed", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": SITE_ORIGIN,
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "86400"
        }
      });
    }

    if (request.method !== "GET") {
      return json({ ok: false, error: "Method not allowed" }, 405);
    }

    if (url.pathname === "/health" || url.pathname === "/api/status") {
      return json({
        ok: true,
        service: "CENTRAL IA API",
        mode: "foundation_only",
        checked_at: new Date().toISOString(),
        capabilities: {
          scheduled_runtime: true,
          autonomous_ai_tasks: false,
          push_delivery: false,
          external_account_access: false,
          financial_execution: false
        },
        next_steps: [
          "Deploy this Worker in Cloudflare",
          "Configure secure storage and AI provider secrets",
          "Implement authenticated task queue and approval workflow",
          "Implement push subscription storage and VAPID delivery"
        ]
      });
    }

    return json({ ok: false, error: "Not found" }, 404);
  },

  async scheduled(controller, env, ctx) {
    // Scheduled trigger proves the cloud runtime is alive.
    // No external actions or AI tasks are executed by this scaffold.
    console.log("CENTRAL IA scheduled runtime heartbeat", {
      scheduledTime: controller.scheduledTime,
      cron: controller.cron
    });
  }
};
