import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ui = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("monitor público distingue integração verificada de apenas configurada", () => {
  assert.match(ui, /data\.health_audit_fresh&&data\.components\?\.\[name\]\?'verificado'/);
  assert.match(ui, /configured\?'configurado • aguardando teste':'não configurado'/);
  assert.match(ui, /data\.health_audit_fresh\?'auditoria recente':'auditoria ausente ou desatualizada'/);
  assert.match(ui, /data\.health_checked_at/);
});
