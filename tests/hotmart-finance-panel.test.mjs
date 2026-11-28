import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("dashboard exposes a Hotmart finance panel without asking for credentials", () => {
  assert.match(html, /id="hotmart-finance-panel"/);
  assert.match(html, /Vendas e comissões — Hotmart/);
  assert.match(html, /id="hotmart-finance-status"/);
  assert.match(html, /id="hotmart-finance-totals"/);
  assert.doesNotMatch(html, /id="hotmart-(client-id|client-secret|basic-token)"/i);
});

test("Hotmart finance panel loads through authenticated read-only API during refresh", () => {
  assert.match(html, /integrations\/hotmart\/sales-summary/);
  assert.match(html, /'Authorization':'Bearer '\+sessionToken/);
  assert.match(html, /loadHotmartFinanceSummary\(\)/);
  assert.match(html, /loadAwinFinanceSummary\(\),loadHotmartFinanceSummary\(\)/);
});

test("Hotmart dashboard separates currency totals and avoids implying bank deposits", () => {
  assert.match(html, /Comissões • '\+currency/);
  assert.match(html, /Os totais são separados por moeda/);
  assert.match(html, /não comprovam saque ou crédito bancário/);
});
