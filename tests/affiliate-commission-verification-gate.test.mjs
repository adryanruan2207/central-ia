import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("campanhas exigem comissão confirmada pela API Awin, atual e correspondente", () => {
  assert.match(worker, /awinVerificationAgeMs >= 0 && awinVerificationAgeMs <= 7 \* 86400000/);
  assert.match(worker, /\/awin\/i\.test\(String\(item\.program_name \|\| ""\)\)/);
  assert.match(worker, /Math\.abs\(verifiedRate - commissionRate\) < 0\.000001/);
  assert.match(worker, /if \(!commissionVerified\) blockers\.push\("Comissão não confirmada recentemente pela API oficial Awin/);
  assert.match(worker, /commissionSourceValid && commissionVerified && estimatedCommissionPerSale/);
  assert.match(worker, /commission_source_verification: commissionVerified \? "verified_from_awin_api"/);
});

test("campanha sem verificação oficial não pode ser preparada no ranking", () => {
  assert.match(worker, /if \(!commissionVerified\) flags\.push\("Comissão ainda não confirmada recentemente pela API oficial Awin/);
  assert.match(worker, /campaignCanBePrepared = hasAffiliateLink && hasProgram && programApproved && commissionValid && commissionSourceValid && commissionVerified/);
});


test("painel de prontidão consulta estado real da conexão Awin sem expor segredos", () => {
  assert.match(worker, /url\.pathname === "\/integrations\/awin\/status"/);
  assert.match(html, /Conexão do programa Awin/);
  assert.match(html, /Conexão ainda não confirmada/);
  assert.match(html, /Os valores secretos não são exibidos aqui/);
});
