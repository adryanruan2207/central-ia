import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const worker = await readFile(new URL("../worker/src/index.js", import.meta.url), "utf8");
const page = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("catálogo informa frescor da pesquisa sem tratar data futura como atual", () => {
  assert.match(worker, /const recordedAtMs = Date\.parse\(latestResearch\?\.recorded_at \|\| ""\)/);
  assert.match(worker, /recordedAtMs <= nowMs/);
  assert.match(worker, /research_age_hours: researchAgeHours/);
  assert.match(worker, /research_fresh: researchAgeHours !== null && researchAgeHours <= 168/);
});

test("catálogo conta somente fontes HTTPS e valida o link de cadastro", () => {
  assert.match(worker, /official_source_count: officialSourceCount/);
  assert.match(worker, /parsed\.protocol === "https:"/);
  assert.match(worker, /signup_url_valid: signupUrlValid/);
});

test("painel diferencia pesquisa recente, fontes, integração e aprovação", () => {
  assert.match(page, /pesquisa recente/);
  assert.match(page, /pesquisa desatualizada/);
  assert.match(page, /fonte\(s\) oficial\(is\) HTTPS/);
  assert.match(page, /integração automática ainda não implementada/);
  assert.match(page, /aprovação não verificada/);
});
