import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const worker = readFileSync(new URL("../worker/src/index.js", import.meta.url), "utf8");

test("Awin credentials are sent only in the Authorization header", () => {
  assert.doesNotMatch(worker, /searchParams\.set\(["']accessToken["']/);
  assert.match(worker, /["']Authorization["']:\s*["']Bearer\s*["']\s*\+\s*env\.AWIN_API_TOKEN/);
});
