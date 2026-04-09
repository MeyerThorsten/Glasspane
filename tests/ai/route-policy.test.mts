import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { authorizeAiRoute } from "../../lib/ai/route-utils.ts";
import { clearAiSharedStore } from "../../lib/ai/shared-store.ts";
import { withEnv } from "./test-helpers.mts";

function createRequest(headers = {}) {
  return new NextRequest("https://example.test/api/ai/chat", {
    method: "POST",
    headers,
  });
}

test("authorizeAiRoute rejects missing API keys when auth is enabled", async () => {
  const restoreEnv = withEnv({
    AI_ROUTE_API_KEYS_JSON: JSON.stringify([{ id: "ops", token: "secret-1", allowedCustomers: ["cust-001"] }]),
  });
  await clearAiSharedStore("quota:");

  try {
    const result = await authorizeAiRoute(createRequest(), "chat", "req-1", "cust-001");
    assert.ok("response" in result);
    assert.equal(result.response.status, 401);
  } finally {
    restoreEnv();
  }
});

test("authorizeAiRoute enforces allowed customers", async () => {
  const restoreEnv = withEnv({
    AI_ROUTE_API_KEYS_JSON: JSON.stringify([{ id: "ops", token: "secret-2", allowedCustomers: ["cust-001"] }]),
  });
  await clearAiSharedStore("quota:");

  try {
    const result = await authorizeAiRoute(
      createRequest({ authorization: "Bearer secret-2" }),
      "summary",
      "req-2",
      "cust-002",
    );
    assert.ok("response" in result);
    assert.equal(result.response.status, 403);
  } finally {
    restoreEnv();
  }
});

test("authorizeAiRoute applies tenant-aware quota buckets by customer", async () => {
  const restoreEnv = withEnv({
    AI_ROUTE_API_KEYS_JSON: JSON.stringify([{ id: "ops", token: "secret-3", allowedCustomers: ["*"] }]),
    AI_ROUTE_STANDARD_LIMIT_PER_MINUTE: "2",
    AI_ROUTE_ENTERPRISE_LIMIT_PER_MINUTE: "2",
    AI_ROUTE_ENTERPRISE_PREMIUM_LIMIT_PER_MINUTE: "2",
  });
  await clearAiSharedStore("quota:");

  try {
    const request = createRequest({ authorization: "Bearer secret-3" });
    const first = await authorizeAiRoute(request, "chat", "req-3a", "cust-001");
    const second = await authorizeAiRoute(request, "chat", "req-3b", "cust-001");
    const third = await authorizeAiRoute(request, "chat", "req-3c", "cust-001");
    const otherTenant = await authorizeAiRoute(request, "chat", "req-3d", "cust-002");

    assert.ok("context" in first);
    assert.ok("context" in second);
    assert.ok("response" in third);
    assert.equal(third.response.status, 429);
    assert.ok("context" in otherTenant);
    assert.equal(otherTenant.context.quotaUsed, 1);
  } finally {
    restoreEnv();
  }
});
