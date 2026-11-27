import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");

test("datas futuras não tornam pesquisa de produto artificialmente recente", () => {
  const freshnessChecks = worker.match(/const researchTimestampValid = Number\.isFinite\(lastResearchedAtMs\) && lastResearchedAtMs <= Date\.now\(\);/g) || [];
  assert.equal(freshnessChecks.length, 2, "shortlist e campaign readiness devem rejeitar timestamps futuros");
  assert.match(worker, /const researchAgeDays = researchTimestampValid \? Math\.floor\(\(Date\.now\(\) - lastResearchedAtMs\) \/ 86400000\) : null/);
  assert.match(worker, /const researchIsOld = researchAgeDays === null \|\| researchAgeDays > 7/);
});

test("snapshot de preço e vendas com data futura exige nova pesquisa", () => {
  assert.match(worker, /const observedTimestampValid = Number\.isFinite\(observedAtMs\) && observedAtMs <= Date\.now\(\);/);
  assert.match(worker, /const observedAgeHours = observedTimestampValid \? \(Date\.now\(\) - observedAtMs\) \/ 3600000 : null/);
  assert.match(worker, /const catalogSnapshotFresh = observedAgeHours !== null && observedAgeHours <= 48/);
});

test("verificação Awin também rejeita data futura de confirmação", () => {
  assert.match(worker, /awinVerificationAgeMs >= 0 && awinVerificationAgeMs <= 7 \* 86400000/);
});
