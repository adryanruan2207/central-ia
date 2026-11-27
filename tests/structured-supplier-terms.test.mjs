import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");

test("termos de fornecedores são extraídos apenas como evidência pública rastreável", () => {
  const start = worker.indexOf('if (url.pathname === "/affiliates/suppliers" && request.method === "GET")');
  const end = worker.indexOf('if (url.pathname === "/affiliates/supplier-leads"', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const route = worker.slice(start, end);
  assert.match(route, /parsePublishedTerms/);
  assert.match(route, /minimum_order/);
  assert.match(route, /listed_price/);
  assert.match(route, /delivery_time/);
  assert.match(route, /shipping_regions/);
  assert.match(route, /returns_policy_evidence/);
  assert.match(route, /status:value \? "published_evidence_found" : "not_found"/);
  assert.match(route, /source_url:sourceUrl/);
  assert.match(route, /observed_at:observedAt/);
  assert.match(route, /total_landed_cost:\{status:"not_calculated",value:null/);
  assert.match(route, /verification_status: "unverified"/);
  assert.match(route, /terms_observed_at: observedAt/);
});
