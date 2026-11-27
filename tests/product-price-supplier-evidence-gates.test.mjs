import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");

test("catálogo não trata preço ou vendas com mais de 48h como atuais", () => {
  assert.match(worker, /const observedAgeHours = Number\.isFinite\(observedAtMs\)/);
  assert.match(worker, /observedAgeHours <= 48/);
  assert.match(worker, /const price = catalogSnapshotFresh \? historicalPrice : null/);
  assert.match(worker, /const sales = catalogSnapshotFresh \? historicalSales : null/);
  assert.match(worker, /catalog_snapshot_status: catalogSnapshotFresh \? "current_within_48_hours" : "historical_refresh_required"/);
  assert.match(worker, /Preço e vendas do catálogo estão desatualizados ou sem data/);
});

test("pesquisa de fornecedores rejeita marketplaces varejistas e exige evidência mínima", () => {
  assert.match(worker, /const marketplaceHosts = new Set/);
  assert.match(worker, /mercadolivre\.com\.br/);
  assert.match(worker, /amazon\.com\.br/);
  assert.match(worker, /const supplierEvidencePattern = \/dropship/);
  assert.match(worker, /isMarketplace \|\| !supplierEvidencePattern\.test\(evidenceText\)/);
  assert.match(worker, /verification_status: "unverified"/);
  assert.match(worker, /pedido mínimo, estoque, envio, preço e condições exigem validação direta/);
});
