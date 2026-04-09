import test from "node:test";
import assert from "node:assert/strict";
import { anthropicProvider } from "../../../lib/ai/providers/anthropic.ts";
import { jsonResponse, withEnv, withMockFetch } from "../test-helpers.mts";

test("anthropicProvider maps system prompts and conversation messages", async () => {
  const restoreEnv = withEnv({
    ANTHROPIC_API_KEY: "anthropic-key",
    ANTHROPIC_MODEL_ID: "claude-demo",
    ANTHROPIC_BASE_URL: "https://anthropic.example.test/v1",
    ANTHROPIC_VERSION: "2023-06-01",
  });
  const restoreFetch = withMockFetch(async (input, init) => {
    assert.equal(String(input), "https://anthropic.example.test/v1/messages");
    assert.equal(init?.headers?.["x-api-key"], "anthropic-key");

    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, "claude-demo");
    assert.equal(body.system, "You are helpful.");
    assert.deepEqual(body.messages, [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi" },
      { role: "user", content: "Summarize this" },
    ]);

    return jsonResponse({
      content: [
        { type: "text", text: "Line one" },
        { type: "text", text: "Line two" },
      ],
    });
  });

  try {
    const result = await anthropicProvider.generateText({
      task: "summary",
      messages: [
        { role: "system", content: "You are helpful." },
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
        { role: "user", content: "Summarize this" },
      ],
    });

    assert.equal(result, "Line one\nLine two");
  } finally {
    restoreFetch();
    restoreEnv();
  }
});
