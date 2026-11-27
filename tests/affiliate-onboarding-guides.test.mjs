import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");
const page = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("guia oficial de Awin separa aprovação da rede e dos anunciantes", () => {
  assert.match(worker, /awin: \{/);
  assert.match(worker, /18 anos ou mais/);
  assert.match(worker, /cada anunciante pode exigir uma candidatura separada/);
  assert.match(worker, /dados fiscais e bancários/i);
  assert.match(worker, /FAQ brasileira informa cadastro gratuito/);
});

test("guia Hotmart diferencia cadastro gratuito e aprovação por produto", () => {
  assert.match(worker, /hotmart: \{/);
  assert.match(worker, /cadastro gratuito para afiliados/);
  assert.match(worker, /automática, depender de aprovação do produtor ou não estar disponível/);
  assert.match(worker, /site não é obrigatório/i);
});

test("guias são enviados no catálogo e renderizados com links HTTPS", () => {
  assert.match(worker, /onboarding_guide: onboardingGuides\[program\.id\] \|\| null/);
  assert.match(page, /Requisitos e próximos passos \(referência oficial\)/);
  assert.match(page, /program\.onboarding_guide\.official_urls/);
  assert.match(page, /parsed\.protocol!=='https:'/);
});
