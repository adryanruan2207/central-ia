import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");
const start = worker.indexOf('if (url.pathname === "/affiliates/campaign-kit"');
const end = worker.indexOf('if (url.pathname === "/affiliates/campaign-kits"', start);
assert.notEqual(start, -1, "campaign-kit route must exist");
assert.notEqual(end, -1, "campaign-kits route must follow campaign-kit");
const route = worker.slice(start, end);

test("campaign kit requires a recent catalog research event for the exact product", () => {
  assert.match(route, /json_extract\(details, '\$\.product_id'\) = p\.id/);
  assert.match(route, /AS last_researched_at/);
  assert.match(route, /researchAgeDays > 7/);
  assert.match(route, /Sem pesquisa de catálogo nos últimos 7 dias/);
});

test("campaign kit requires fresh Awin verification matching the saved commission rate", () => {
  assert.match(route, /awin_product_commission_verified/);
  assert.match(route, /awinVerificationAgeMs >= 0 && awinVerificationAgeMs <= 7 \* 86400000/);
  assert.match(route, /\/awin\/i\.test\(String\(item\.program_name \|\| ""\)\)/);
  assert.match(route, /Math\.abs\(verifiedRate - commissionRate\) < 0\.000001/);
  assert.match(route, /Comissão não confirmada recentemente pela API oficial Awin/);
});

test("campaign kit returns a conflict before generating or saving a draft when blocked", () => {
  const block = route.indexOf("if (blockers.length) return json");
  const ai = route.indexOf("env.AI.run");
  const save = route.indexOf("INSERT INTO publication_queue");
  assert.ok(block > -1 && ai > block && save > ai);
});

test("campaign readiness explains provider-specific verification gaps without falsely blaming Awin", () => {
  assert.match(route, /Este programa ainda não possui integração oficial de verificação de comissão na CENTRAL IA/);
  assert.match(route, /\/awin\/i\.test\(String\(item\.program_name \|\| ""\)\)/);
});
