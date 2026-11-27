import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");
const programMigration = await readFile(new URL("../worker/migrations/0003_affiliate_programs.sql", import.meta.url), "utf8");

test("cron prioriza programas de afiliados e pesquisa a cada seis horas", () => {
  assert.match(worker, /const programResearchIntervalMs = 6 \* 60 \* 60 \* 1000/);
  assert.match(worker, /Date\.now\(\) - lastProgramResearchMs >= programResearchIntervalMs/);
  assert.match(worker, /const batchSize = 3/);
  assert.match(worker, /const cycleIndex = Math\.floor\(Date\.now\(\) \/ programResearchIntervalMs\)/);
  assert.match(worker, /const selectedPrograms = Array\.from/);
  assert.match(worker, /for \(const program of selectedPrograms\)/);
  const ids = ["awin", "cj-affiliate", "impact", "rakuten", "partnerstack", "ebay-partner", "aliexpress-portals", "hotmart", "amazon-associates", "clickbank", "digistore24", "awin-tradedoubler", "webgains", "partnerize"];
  const schedulerStart = worker.indexOf("const programs = [", worker.indexOf("programResearchIntervalMs"));
  const schedulerEnd = worker.indexOf("];", schedulerStart);
  const scheduler = worker.slice(schedulerStart, schedulerEnd);
  for (const id of ids) {
    assert.ok(scheduler.includes('id: "' + id + '"'), "programa ausente ou com ID incorreto no ciclo: " + id);
    assert.ok(programMigration.includes("('" + id + "',"), "programa não cadastrado no catálogo: " + id);
  }
});

test("pesquisa automática de fornecedores fica pausada durante a etapa de afiliados", () => {
  const scheduledStart = worker.indexOf("async scheduled(event, env, ctx)");
  const scheduled = worker.slice(scheduledStart);
  assert.match(scheduled, /Modo afiliados primeiro/);
  assert.doesNotMatch(scheduled, /automatic_supplier_discovery/);
  assert.match(worker, /url\.pathname === "\/affiliates\/suppliers"/);
});
