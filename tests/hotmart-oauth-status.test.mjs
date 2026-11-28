import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../worker/src/index.js", import.meta.url), "utf8");

test("Hotmart OAuth requires all three server-side credentials", () => {
  assert.match(source, /HOTMART_CLIENT_ID/);
  assert.match(source, /HOTMART_CLIENT_SECRET/);
  assert.match(source, /HOTMART_BASIC_TOKEN/);
  assert.match(source, /HOTMART_BASIC_TOKEN.*filter\(Boolean\)/s);
});

test("Hotmart connection status validates OAuth without returning access tokens", () => {
  const start = source.indexOf('url.pathname === "/integrations/hotmart/status"');
  const end = source.indexOf('url.pathname === "/integrations/awin/status"', start);
  assert.ok(start >= 0 && end > start, "Hotmart status route must exist before Awin route");
  const route = source.slice(start, end);
  assert.match(route, /getHotmartAccessToken\(env\)/);
  assert.match(route, /connected: true/);
  assert.doesNotMatch(route, /access_token\s*:/);
  assert.doesNotMatch(route, /client_secret\s*:/);
  assert.match(route, /não confirma aprovação como afiliado/i);
});

test("Hotmart OAuth sends Basic authorization and caches only until expiry", () => {
  assert.match(source, /"Authorization": "Basic " \+ basicToken/);
  assert.match(source, /expires_in/);
  assert.match(source, /expiresAt > Date\.now\(\) \+ 60_000/);
  assert.match(source, /AbortSignal\.timeout\(15000\)/);
  assert.match(source, /hotmartAccessTokenCache = null/);
});

test("Hotmart integration readiness requires the Basic credential too", () => {
  assert.match(source, /id:"hotmart",name:"Hotmart",keys:\["HOTMART_CLIENT_ID","HOTMART_CLIENT_SECRET","HOTMART_BASIC_TOKEN"\]/);
});
