import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");

test("eventos de pesquisa e comissão são associados ao ID exato do produto", () => {
  const shortlistStart = worker.indexOf('if (url.pathname === "/affiliates/shortlist/analyze" && request.method === "GET")');
  const shortlistEnd = worker.indexOf('if (url.pathname.startsWith("/affiliates/products/")', shortlistStart);
  const readinessStart = worker.indexOf('if (url.pathname === "/affiliates/campaign-readiness" && request.method === "GET")');
  const readinessEnd = worker.indexOf('if (url.pathname.startsWith("/affiliates/products/")', readinessStart);
  const shortlist = worker.slice(shortlistStart, shortlistEnd);
  const readiness = worker.slice(readinessStart, readinessEnd);
  const exactMatch = "json_extract(details, '$.product_id') = p.id";
  assert.equal(shortlist.split(exactMatch).length - 1, 4);
  assert.equal(readiness.split(exactMatch).length - 1, 3);
  assert.doesNotMatch(shortlist + readiness, /details LIKE/);
});
