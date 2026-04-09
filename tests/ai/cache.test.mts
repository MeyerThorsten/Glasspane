import test from "node:test";
import assert from "node:assert/strict";
import { clearAiCache, createAiCache } from "../../lib/ai/cache.ts";

test("createAiCache remembers values within the TTL", async () => {
  const cache = createAiCache("test-cache");
  await clearAiCache("test-cache");

  let loadCount = 0;
  const first = await cache.remember("customer-1", 1_000, async () => {
    loadCount += 1;
    return { value: "cached" };
  });
  const second = await cache.remember("customer-1", 1_000, async () => {
    loadCount += 1;
    return { value: "new" };
  });

  assert.deepEqual(first, { value: "cached" });
  assert.deepEqual(second, { value: "cached" });
  assert.equal(loadCount, 1);
});

test("createAiCache deduplicates concurrent loaders", async () => {
  const cache = createAiCache<number>("test-cache-dedupe");
  await clearAiCache("test-cache-dedupe");

  let loadCount = 0;
  const values = await Promise.all([
    cache.remember("shared", 1_000, async () => {
      loadCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return 42;
    }),
    cache.remember("shared", 1_000, async () => {
      loadCount += 1;
      return 99;
    }),
  ]);

  assert.deepEqual(values, [42, 42]);
  assert.equal(loadCount, 1);
});
