import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("affiliate score UI explains every scoring component", () => {
  assert.match(page, /Ver composição da pontuação/);
  for (const label of [
    "Sinal público de vendas", "Comissão verificada", "Prontidão operacional",
    "Atualidade da pesquisa", "Completude das evidências"
  ]) assert.ok(page.includes(label), "missing score label: " + label);
  assert.match(page, /não representa probabilidade de venda, lucro, aprovação ou recebimento/i);
});
