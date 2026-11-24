import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");
const ui = await readFile(new URL("../index.html", import.meta.url), "utf8");
const wrangler = await readFile(new URL("../worker/wrangler.toml", import.meta.url), "utf8");

test("patches só podem ser preparados após aprovação explícita", () => {
  const start = worker.indexOf('if (url.pathname === "/developer/patch/prepare"');
  assert.notEqual(start, -1);
  const section = worker.slice(start, start + 9000);
  assert.match(section, /approved_for_patch/);
  assert.match(section, /worker\/wrangler\.toml/);
  assert.match(section, /files\.length!==1/);
});

test("preparação preserva os bindings e limites obrigatórios", () => {
  for (const value of [
    'name = "central-ia-worker"',
    'main = "src/index.js"',
    'compatibility_date = "2026-11-19"',
    'binding = "DB"',
    'database_name = "central-ia-db"',
    'database_id = "59f3056f-c6a2-4c95-9d1e-2ba9aad2091a"',
    'binding = "AI"'
  ]) assert.ok(wrangler.includes(value), `Configuração ausente: ${value}`);
  const start = worker.indexOf('if (url.pathname === "/developer/patch/prepare"');
  const section = worker.slice(start, start + 9000);
  assert.match(section, /const required=\[/);
  assert.match(section, /database_id/);
  assert.match(section, /updated\.length>16000/);
  assert.match(section, /password/);
});

test("patch candidato é registrado sem aplicação automática", () => {
  assert.match(worker, /candidate_only_not_applied/);
  assert.match(worker, /original_sha256/);
  assert.match(worker, /candidate_sha256/);
  assert.doesNotMatch(worker, /url\.pathname\s*===\s*["']\/developer\/patch\/apply["']/);
});

test("verificação de patch é estática e nunca declara aplicação", () => {
  const start = worker.indexOf('if (url.pathname === "/developer/patch/verify"');
  assert.notEqual(start, -1);
  const section = worker.slice(start, start + 7000);
  assert.match(section, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(section, /ready_for_isolated_test:false/);
  assert.match(section, /applied:false/);
  assert.match(section, /static_only_no_execution/);
});

test("histórico e verificação possuem rotas e controles na interface", () => {
  assert.ok(worker.includes('/developer/patch/verification-history'));
  assert.ok(worker.includes('/developer/patches'));
  assert.ok(ui.includes("Verificar patch"));
  assert.ok(ui.includes("Ver histórico de verificações"));
  assert.ok(ui.includes("loadDeveloperPatchVerificationHistory"));
});

test("configuração do Worker mantém os bindings essenciais", () => {
  assert.match(wrangler, /^name = "central-ia-worker"$/m);
  assert.match(wrangler, /^main = "src\/index.js"$/m);
  assert.match(wrangler, /^binding = "DB"$/m);
  assert.match(wrangler, /^binding = "AI"$/m);
  assert.match(wrangler, /database_id = "59f3056f-c6a2-4c95-9d1e-2ba9aad2091a"/);
});
