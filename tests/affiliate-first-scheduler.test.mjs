import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");

test("cron prioriza programas de afiliados e pesquisa a cada seis horas", () => {
  assert.match(worker, /const programResearchIntervalMs = 6 \* 60 \* 60 \* 1000/);
  assert.match(worker, /Date\.now\(\) - lastProgramResearchMs >= programResearchIntervalMs/);
  assert.match(worker, /Math\.floor\(Date\.now\(\) \/ programResearchIntervalMs\) % programs\.length/);
  for (const id of ["awin", "cj", "impact", "rakuten", "partnerstack", "ebay", "aliexpress", "amazon-associates", "clickbank", "digistore24", "tradedoubler", "webgains", "partnerize"]) {
    assert.ok(worker.includes('id: "' + id + '"'), "programa ausente do ciclo: " + id);
  }
});

test("pesquisa automática de fornecedores fica pausada durante a etapa de afiliados", () => {
  const scheduledStart = worker.indexOf("async scheduled(event, env, ctx)");
  const scheduled = worker.slice(scheduledStart);
  assert.match(scheduled, /Modo afiliados primeiro/);
  assert.doesNotMatch(scheduled, /automatic_supplier_discovery/);
  assert.match(worker, /url\.pathname === "\/affiliates\/suppliers"/);
});
