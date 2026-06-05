import test from "node:test";
import assert from "node:assert/strict";
import { executeTextForTask } from "../../lib/ai/router.ts";
import { clearAiSharedStore } from "../../lib/ai/shared-store.ts";
import { withEnv, withMockFetch } from "./test-helpers.mts";

const REQUEST = {
  messages: [{ role: "user", content: "Summarize" }],
};

test("executeTextForTask falls back through the configured provider chain", async () => {
  const restoreEnv = withEnv({
    AI_PROVIDER: "openai",
    AI_SUMMARY_PROVIDER: "openai",
    AI_SUMMARY_FALLBACKS: "mock",
    OPENAI_API_KEY: "openai-key",
    OPENAI_MODEL_ID: "openai-demo",
  });
  const restoreFetch = withMockFetch(async () => new Response("upstream down", { status: 503 }));
  await clearAiSharedStore("model-telemetry:");

  try {
    const result = await executeTextForTask("summary", REQUEST);
    assert.equal(result.provider, "mock");
    assert.equal(result.modelInfo.fallbackCount, 1);
    assert.match(result.text, /service delivery|SLA/i);
  } finally {
    restoreFetch();
    restoreEnv();
  }
});

test("executeTextForTask reports a clear all-provider failure", async () => {
  const restoreEnv = withEnv({
    AI_PROVIDER: "openai",
    AI_SUMMARY_PROVIDER: "openai",
    AI_SUMMARY_FALLBACKS: undefined,
    OPENAI_API_KEY: "openai-key",
    OPENAI_MODEL_ID: "openai-demo",
  });
  const restoreFetch = withMockFetch(async () => new Response("upstream down", { status: 503 }));
  await clearAiSharedStore("model-telemetry:");

  try {
    await assert.rejects(
      () => executeTextForTask("summary", REQUEST),
      /All AI providers failed for task "summary"/,
    );
  } finally {
    restoreFetch();
    restoreEnv();
  }
});
