import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");
const page = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("affiliate shortlist maps each operational blocker to a clear next action", () => {
  const start = worker.indexOf('if (url.pathname === "/affiliates/shortlist/analyze"');
  assert.notEqual(start, -1);
  const section = worker.slice(start, start + 18000);
  for (const status of [
    "blocked_stale_research", "blocked_invalid_product_url", "blocked_stale_snapshot",
    "awaiting_program_selection", "awaiting_program_approval", "awaiting_tracking_link",
    "awaiting_commission_verification", "blocked_missing_price", "needs_demand_evidence",
    "ready_for_manual_review"
  ]) assert.ok(section.includes(status), "missing status: " + status);
  assert.match(section, /next_action_code: nextActionCode/);
  assert.match(section, /decision_reason: decisionReason/);
});

test("high score never overrides operational blockers or publication safety", () => {
  const start = worker.indexOf('if (url.pathname === "/affiliates/shortlist/analyze"');
  const section = worker.slice(start, start + 18000);
  assert.match(section, /Score alto nunca sobrepõe falta de aprovação, comissão ou dados atuais/);
  assert.match(section, /campaign_can_be_published: false/);
  assert.match(section, /ready_for_manual_review/);
  assert.match(section, /ainda exige revisão humana/);
});

test("affiliate shortlist UI displays score and concrete next action", () => {
  assert.match(page, /Pontuação de oportunidade:/);
  assert.match(page, /Decisão operacional:/);
  assert.match(page, /Próxima ação:/);
  assert.match(page, /awaiting_commission_verification/);
});
