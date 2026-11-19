const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

function cors(request, response) {
  const origin = request.headers.get("Origin") || "";
  const headers = new Headers(response.headers);
  if (origin.endsWith(".github.io") || origin === "https://adryanruan2207.github.io") {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, { status: response.status, headers });
}

async function record(env, event, details = "") {
  if (!env.DB) return;
  await env.DB.prepare("INSERT INTO activity_log(event, details, created_at) VALUES (?, ?, ?)")
    .bind(event, details, new Date().toISOString()).run();
}

async function handle(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (url.pathname === "/health" && request.method === "GET") {
    return json({ service: "CENTRAL IA", status: "online", database: Boolean(env.DB), time: new Date().toISOString() });
  }
  if (!env.API_TOKEN || request.headers.get("Authorization") !== `Bearer ${env.API_TOKEN}`) {
    return json({ error: "Não autorizado" }, 401);
  }
  if (!env.DB) return json({ error: "Banco D1 ainda não configurado" }, 503);

  if (url.pathname === "/tasks" && request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT id, title, task_type, status, requires_approval, result, created_at, updated_at FROM tasks ORDER BY created_at DESC LIMIT 100"
    ).all();
    return json({ tasks: result.results || [] });
  }

  if (url.pathname === "/tasks" && request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "JSON inválido" }, 400); }
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
    const type = ["research", "analysis", "draft", "maintenance"].includes(body.task_type) ? body.task_type : "research";
    if (!title) return json({ error: "Informe o título da tarefa" }, 400);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    // Tarefas criadas entram na fila; este primeiro Worker não executa ações externas.
    await env.DB.prepare(
      "INSERT INTO tasks(id, title, task_type, status, requires_approval, created_at, updated_at) VALUES (?, ?, ?, 'queued', 0, ?, ?)"
    ).bind(id, title, type, now, now).run();
    await record(env, "task_created", id);
    return json({ id, status: "queued", message: "Tarefa registrada na nuvem." }, 201);
  }
  return json({ error: "Rota não encontrada" }, 404);
}

export default {
  async fetch(request, env) {
    try { return cors(request, await handle(request, env)); }
    catch (error) {
      console.error("CENTRAL IA Worker error", error);
      return cors(request, json({ error: "Erro interno do serviço" }, 500));
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      await record(env, "scheduled_check", "Verificação automática executada.");
      if (env.DB) {
        await env.DB.prepare(
          "UPDATE tasks SET status = 'needs_review', updated_at = ? WHERE status = 'queued' AND requires_approval = 1"
        ).bind(new Date().toISOString()).run();
      }
    })());
  }
};
