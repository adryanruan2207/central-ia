import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");

test("shortlist ranks opportunities with transparent evidence-based score", () => {
  assert.match(worker, /const demandPoints = sales === null \? 0/);
  assert.match(worker, /const commissionPoints = commissionVerified \?/);
  assert.match(worker, /const readinessPoints =/);
  assert.match(worker, /const freshnessPoints =/);
  assert.match(worker, /const evidencePoints =/);
  assert.match(worker, /opportunity_score: opportunityScore/);
  assert.match(worker, /opportunity_tier: opportunityTier/);
  assert.match(worker, /b\.opportunity_score - a\.opportunity_score/);
});

test("score does not imply verified demand, profit or publication authorization", () => {
  assert.match(worker, /vendas públicas são apenas um sinal indireto de interesse/i);
  assert.match(worker, /Concorrência, custos, impostos, devoluções, conversão e lucro líquido não entram no score/i);
  assert.match(worker, /não autoriza divulgação, compra ou publicação/i);
  assert.match(worker, /concorrência, conversão ou lucro/i);
});
