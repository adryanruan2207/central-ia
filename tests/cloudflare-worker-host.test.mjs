import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("all frontend Worker requests use the canonical Cloudflare hostname", () => {
  assert.doesNotMatch(page, /central-ia-worker\.adryanru2207\.workers\.dev/);
  assert.match(page, /central-ia-worker\.adryanruan2207\.workers\.dev/);
});
