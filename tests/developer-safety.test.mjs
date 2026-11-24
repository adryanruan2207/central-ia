import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import vm from "node:vm";

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

test("Worker e scripts JavaScript da interface não possuem erros de sintaxe", () => {
  const workerCheck = spawnSync(process.execPath, ["--input-type=module", "--check"], {
    input: worker, encoding: "utf8"
  });
  assert.equal(workerCheck.status, 0, workerCheck.stderr || workerCheck.stdout);

  const scripts = [...ui.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const executable = scripts.filter(([, attrs]) =>
    !/\bsrc\s*=/.test(attrs) &&
    !/\btype\s*=\s*["'](?:application\/json|application\/ld\+json)["']/i.test(attrs)
  );
  assert.ok(executable.length > 0, "Nenhum script JavaScript inline encontrado");
  for (let i = 0; i < executable.length; i++) {
    new vm.Script(executable[i][2], { filename: "index.html:inline-script-" + (i + 1) });
  }
});

test("implantação do Worker depende da aprovação dos testes", async () => {
  const workflow = await readFile(new URL("../.github/workflows/deploy-worker.yml", import.meta.url), "utf8");
  assert.match(workflow, /node --test tests\/\*\.test\.mjs/);
  assert.match(workflow, /deploy:\n\s+needs: test/);
});

test("planejador da IA permanece somente leitura e possui limite de uso", () => {
  const start = worker.indexOf('url.pathname === "/developer/plan" && request.method === "POST"');
  assert.notEqual(start, -1);
  const section = worker.slice(start, start + 14000);
  assert.match(section, /developer_plan_created/);
  assert.match(section, />= 5/);
  assert.match(section, /alterações de código não são executadas/);
  assert.match(section, /mode:\s*"read_only_plan"/);
  assert.doesNotMatch(section, /child_process|execSync|spawnSync|wrangler deploy/);
});

test("propostas da IA só aceitam caminhos da lista permitida", () => {
  const start = worker.indexOf('url.pathname === "/developer/proposal" && request.method === "POST"');
  assert.notEqual(start, -1);
  const section = worker.slice(start, start + 6000);
  assert.match(section, /const allowedFiles = \[/);
  assert.match(section, /allowedFiles\.includes\(file\.path\)/);
  assert.match(section, /slice\(0,5\)/);
  assert.match(section, /applied:false/);
});

test("revisão de proposta é única e não altera arquivos", () => {
  const start = worker.indexOf('url.pathname === "/developer/proposal/review" && request.method === "POST"');
  assert.notEqual(start, -1);
  const section = worker.slice(start, start + 2600);
  assert.match(section, /approved_for_patch/);
  assert.match(section, /rejected/);
  assert.match(section, /já foi revisada/);
  assert.match(section, /scope:"review_only_no_code_changes"/);
  assert.match(section, /applied:false/);
});

test("preparação de patch exige aprovação e limita o escopo a um arquivo", () => {
  const start = worker.indexOf('url.pathname === "/developer/patch/prepare" && request.method === "POST"');
  assert.notEqual(start, -1);
  const section = worker.slice(start, start + 5200);
  assert.match(section, /approved_for_patch/);
  assert.match(section, /files\.length!==1/);
  assert.match(section, /worker\/wrangler\.toml/);
  assert.match(section, /Já existe um patch candidato/);
});

test("validação isolada do Worker usa dry-run e não publica na produção", async () => {
  const workflow = await readFile(new URL("../.github/workflows/central-ia-isolated-validation.yml", import.meta.url), "utf8");
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /wrangler deploy --dry-run/);
  assert.match(workflow, /permissions:[\\s\\S]*contents: read/);
  assert.doesNotMatch(workflow, /CLOUDFLARE_API_TOKEN|secrets[.]/);
  assert.doesNotMatch(workflow, /wrangler deploy(?! --dry-run)/);
});
