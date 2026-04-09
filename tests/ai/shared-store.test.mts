import test from "node:test";
import assert from "node:assert/strict";
import { getAiSharedStore } from "../../lib/ai/shared-store.ts";
import { jsonResponse, withEnv, withMockFetch } from "./test-helpers.mts";

test("upstash shared store sends command bodies expected by the REST API", async () => {
  const requests = [];
  const restoreEnv = withEnv({
    AI_SHARED_CACHE_BACKEND: "upstash",
    AI_SHARED_CACHE_URL: "https://cache.example.test",
    AI_SHARED_CACHE_TOKEN: "cache-token",
  });
  const restoreFetch = withMockFetch(async (input, init) => {
    requests.push({
      url: String(input),
      method: init?.method || "GET",
      body: init?.body ? String(init.body) : "",
      headers: init?.headers,
    });

    if (String(input).endsWith("/multi-exec")) {
      return jsonResponse([{ result: "OK" }, { result: 3 }, { result: 45000 }]);
    }

    return jsonResponse({ result: "OK" });
  });

  try {
    const store = getAiSharedStore();
    await store.set("cache:key-1", "{\"value\":1}", 1000);
    await store.incrementFixedWindow("quota:chat:cust-001", 60000);

    assert.equal(requests[0].url, "https://cache.example.test");
    const setCommand = JSON.parse(requests[0].body);
    assert.deepEqual(setCommand, [
      "SET",
      `${setCommand[1].split(":cache:")[0]}:cache:key-1`,
      "{\"value\":1}",
      "PX",
      1000,
    ]);

    assert.equal(requests[1].url, "https://cache.example.test/multi-exec");
    const transaction = JSON.parse(requests[1].body);
    assert.deepEqual(transaction, [
      [
        "SET",
        `${transaction[0][1].split(":quota:")[0]}:quota:chat:cust-001`,
        "0",
        "PX",
        60000,
        "NX",
      ],
      [
        "INCR",
        `${transaction[1][1].split(":quota:")[0]}:quota:chat:cust-001`,
      ],
      [
        "PTTL",
        `${transaction[2][1].split(":quota:")[0]}:quota:chat:cust-001`,
      ],
    ]);
  } finally {
    restoreFetch();
    restoreEnv();
  }
});
