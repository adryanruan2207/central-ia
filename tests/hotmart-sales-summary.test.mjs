import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../worker/src/index.js", import.meta.url), "utf8");
const start = source.indexOf('url.pathname === "/integrations/hotmart/sales-summary"');
const end = source.indexOf('url.pathname === "/integrations/awin/status"', start);
const route = source.slice(start, end);

test("Hotmart sales summary is read-only and uses the documented sales summary endpoint", () => {
  assert.ok(start >= 0 && end > start, "sales summary route must exist before Awin status route");
  assert.match(route, /https:\/\/developers\.hotmart\.com\/payments\/api\/v1\/sales\/summary/);
  assert.match(route, /Authorization": "Bearer " \+ authResult\.token/);
  assert.match(route, /method:\s*"GET"|fetch\(endpoint\.toString\(\),\s*\{/);
  assert.doesNotMatch(route, /method:\s*"(POST|PUT|PATCH|DELETE)"/);
});

test("Hotmart summary validates dates, product IDs, and official transaction statuses", () => {
  assert.match(route, /intervalo máximo de 90 dias/);
  assert.match(route, /product_id deve conter exatamente 7 dígitos/);
  assert.match(route, /APPROVED.*BLOCKED.*CANCELLED.*CHARGEBACK.*COMPLETE/s);
  assert.match(route, /transaction_status/);
});

test("Hotmart summary has bounded requests and validates the response before accounting", () => {
  assert.match(route, /AbortSignal\.timeout\(15000\)/);
  assert.match(route, /Array\.isArray\(payload\.items\)/);
  assert.match(route, /total_value/);
  assert.match(route, /hotmart_sales_summary_synced/);
  assert.match(route, /Não some moedas diferentes/);
});

test("Hotmart summary never returns OAuth credentials or raw access tokens", () => {
  assert.doesNotMatch(route, /access_token\s*:/);
  assert.doesNotMatch(route, /client_secret\s*:/);
  assert.doesNotMatch(route, /basic_token\s*:/i);
});
