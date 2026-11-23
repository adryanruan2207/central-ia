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


const enc = new TextEncoder();
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,"").replaceAll("+","-").replaceAll("/","_");
async function signSession(payload, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  const data = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return data + "." + b64url(sig);
}
async function validSession(token, secret) {
  try {
    if (!secret || !token || token.length > 2000) return false;
    const [data, signature, extra] = token.split(".");
    if (!data || !signature || extra) return false;
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["verify"]);
    const bytes = Uint8Array.from(atob(signature.replace(/-/g,"+").replace(/_/g,"/") + "=".repeat((4-signature.length%4)%4)), c=>c.charCodeAt(0));
    const ok = await crypto.subtle.verify("HMAC", key, bytes, enc.encode(data));
    if (!ok) return false;
    const payload = JSON.parse(atob(data.replace(/-/g,"+").replace(/_/g,"/") + "=".repeat((4-data.length%4)%4)));
    return payload.sub === "owner" && Number(payload.exp) > Math.floor(Date.now()/1000);
  } catch { return false; }
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
  if (url.pathname === "/auth/login" && request.method === "POST") {
    if (!env.APP_PASSWORD || !env.SESSION_SECRET) return json({ error: "Login ainda não configurado no servidor" }, 503);
    let body;
    try { body = await request.json(); } catch { return json({ error: "JSON inválido" }, 400); }
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || password.length > 200 || password !== env.APP_PASSWORD) return json({ error: "Senha incorreta" }, 401);
    const expiresAt = Math.floor(Date.now()/1000) + 60*60*24*30;
    const token = await signSession({sub:"owner",exp:expiresAt}, env.SESSION_SECRET);
    return json({ token, expires_at: expiresAt });
  }
  const auth = request.headers.get("Authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const isApiToken = Boolean(env.API_TOKEN && bearer === env.API_TOKEN);
  const isSession = await validSession(bearer, env.SESSION_SECRET);
  if (!isApiToken && !isSession) return json({ error: "Sessão expirada ou não autorizada" }, 401);
  if (!env.DB) return json({ error: "Banco D1 ainda não configurado" }, 503);


  if (url.pathname === "/ai/chat" && request.method === "POST") {
    if (!env.AI) return json({ error: "Workers AI ainda não está vinculado" }, 503);
    let body;
    try { body = await request.json(); } catch { return json({ error: "JSON inválido" }, 400); }
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const image = typeof body.image === "string" ? body.image : "";
    if (!message && !image) return json({ error: "Escreva uma mensagem ou anexe uma imagem." }, 400);
    if (message.length > 4000) return json({ error: "Mensagem muito longa (máximo 4000 caracteres)" }, 413);
    if (image && (image.length > 5_500_000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image))) {
      return json({ error: "Imagem inválida ou muito grande. Envie JPEG, PNG ou WEBP de até 3 MB." }, 413);
    }
    const currentDateTime = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "full", timeStyle: "short", timeZone: "America/Sao_Paulo"
    }).format(new Date());
    const systemPrompt = `Você é a CENTRAL IA, assistente em português do Brasil. Data e hora atuais: ${currentDateTime} (fuso horário de Brasília, America/Sao_Paulo). Quando perguntarem o ano, a data ou a hora atuais, use esta informação como fonte correta e não suponha datas antigas. Responda com clareza, seja honesto sobre limitações e nunca afirme ter executado ações que não foram realizadas. Não faça transações financeiras nem ordens de trading. Quando receber uma captura de tela, descreva o que realmente aparece, identifique mensagens de erro e oriente o usuário em passos curtos, sem inventar botões ou informações que não estejam visíveis. Avise se algum texto estiver ilegível. Nunca peça senhas, tokens ou códigos secretos.`;
    let result;
    let model;
    if (image) {
      model = "@cf/meta/llama-3.2-11b-vision-instruct";
      result = await env.AI.run(model, {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message || "Analise esta captura de tela e me oriente sobre o que fazer." }
        ],
        image
      });
    } else {
      model = "@cf/meta/llama-3.1-8b-instruct-fast";
      result = await env.AI.run(model, {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 512,
        temperature: 0.3
      });
    }
    const answer = typeof result?.response === "string" ? result.response : "";
    if (!answer) return json({ error: "O modelo não retornou uma resposta válida" }, 502);
    await record(env, image ? "ai_image_analysis" : "ai_chat", image ? "Imagem analisada pelo modelo de visão." : "Resposta gerada pelo modelo Workers AI.");
    return json({ model, answer });
  }

  if (url.pathname === "/affiliates/products" && request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT id, name, marketplace, product_url, commission_rate, notes, status, created_at, updated_at FROM affiliate_products ORDER BY created_at DESC LIMIT 200"
    ).all();
    return json({ products: result.results || [] });
  }

  if (url.pathname === "/affiliates/products" && request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "JSON inválido" }, 400); }
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 160) : "";
    const marketplace = typeof body.marketplace === "string" ? body.marketplace.trim().toLowerCase() : "";
    const productUrl = typeof body.product_url === "string" ? body.product_url.trim().slice(0, 1000) : "";
    const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : "";
    const commission = body.commission_rate === null || body.commission_rate === undefined || body.commission_rate === ""
      ? null : Number(body.commission_rate);
    const allowedMarketplaces = ["shopee", "mercado livre", "amazon", "hotmart", "outro"];
    if (!name) return json({ error: "Informe o nome do produto" }, 400);
    if (!allowedMarketplaces.includes(marketplace)) return json({ error: "Marketplace inválido" }, 400);
    if (productUrl) {
      try {
        const parsed = new URL(productUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("protocolo inválido");
      } catch { return json({ error: "Informe um link de produto válido (http ou https)" }, 400); }
    }
    if (commission !== null && (!Number.isFinite(commission) || commission < 0 || commission > 100)) {
      return json({ error: "Comissão deve estar entre 0 e 100" }, 400);
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO affiliate_products(id, name, marketplace, product_url, commission_rate, notes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'research', ?, ?)"
    ).bind(id, name, marketplace, productUrl || null, commission, notes || null, now, now).run();
    await record(env, "affiliate_product_created", id);
    return json({ id, status: "research", message: "Oportunidade de produto cadastrada." }, 201);
  }

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
