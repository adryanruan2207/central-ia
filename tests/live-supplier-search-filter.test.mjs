import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");

test("pesquisa direta de fornecedores filtra varejistas e exige evidência pública", () => {
  const start = worker.indexOf('if (url.pathname === "/affiliates/suppliers" && request.method === "GET")');
  const end = worker.indexOf('if (url.pathname === "/affiliates/supplier-leads"', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const route = worker.slice(start, end);
  assert.match(route, /const marketplaceHosts = new Set/);
  assert.ok(route.includes("amazon.com.br"));
  assert.ok(route.includes("mercadolivre.com.br"));
  assert.ok(route.includes(String.raw`atacad\w*`), "padrão deve reconhecer palavras de atacado");
  assert.ok(route.includes(String.raw`/^www\./`), "normalização de www deve usar escape correto");
  assert.match(route, /parsed\.protocol !== "https:"/);
  assert.match(route, /supplierEvidencePattern\.test\(evidenceText\)/);
  assert.match(route, /verification_status: "unverified"/);
  assert.match(route, /candidates: suppliers\.length, rejected/);
  assert.ok(route.includes("Candidatos filtrados por evidências públicas, não fornecedores aprovados."));
});
