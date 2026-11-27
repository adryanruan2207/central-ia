import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");

test("classificação de fornecedores distingue evidência de envio direto de confiança", () => {
  const start = worker.indexOf('if (url.pathname === "/affiliates/suppliers" && request.method === "GET")');
  const end = worker.indexOf('if (url.pathname === "/affiliates/supplier-leads"', start);
  const route = worker.slice(start, end);
  assert.match(route, /directShipEvidence/);
  assert.match(route, /zero_inventory_model/);
  assert.match(route, /direct_shipping_or_fulfillment/);
  assert.match(route, /wholesale_or_moq_evidence_only/);
  assert.match(route, /atacad\\w\*\|pedido m\[ií\]nimo\|MOQ/);
  assert.match(route, /insufficient_public_evidence/);
  assert.match(route, /evidence_completeness/);
  assert.match(route, /não mede confiabilidade, qualidade ou aprovação do fornecedor/);
  assert.match(route, /verification_status: "unverified"/);
  assert.match(route, /total_landed_cost:\{status:"not_calculated",value:null/);
});
