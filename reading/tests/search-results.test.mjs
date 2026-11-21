import assert from "node:assert/strict";
import { test } from "node:test";
import { linkableHits, normalizeQuery } from "../src-reader/features/search/domain/search.ts";

test("readers get same-site results in search order", () => {
  const results = ["/guide/start", "//foreign.example/page", "https://foreign.example", "/guide/end"]
    .map(path => ({ path }));
  assert.deepEqual(linkableHits(results).map(hit => hit.path), ["/guide/start", "/guide/end"]);
});

test("truncating a search term preserves its final Unicode character", () => {
  const query = "𠮷".repeat(200);
  assert.equal(normalizeQuery("  " + query + "more "), query);
});
