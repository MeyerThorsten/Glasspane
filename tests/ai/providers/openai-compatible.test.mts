import test from "node:test";
import assert from "node:assert/strict";
import { runOpenAiCompatibleChat, runOpenAiCompatibleChatStream } from "../../../lib/ai/providers/openai-compatible.ts";
import { collectStream, jsonResponse, sseResponse, withMockFetch } from "../test-helpers.mts";

const REQUEST = {
  task: "chat",
  messages: [{ role: "user", content: "Hello there" }],
};

test("runOpenAiCompatibleChat posts Chat Completions payloads and normalizes array content", async () => {
  const restoreFetch = withMockFetch(async (input, init) => {
    assert.equal(String(input), "https://api.example.test/chat/completions");
    assert.equal(init?.method, "POST");
    assert.equal(init?.headers?.Authorization, "Bearer openai-token");

    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, "demo-model");
    assert.equal(body.messages[0].content, "Hello there");

    return jsonResponse({
      choices: [
        {
          message: {
            content: [{ type: "output_text", text: "Hello " }, { type: "output_text", text: "world" }],
          },
        },
      ],
    });
  });

  try {
    const result = await runOpenAiCompatibleChat(REQUEST, {
      baseUrl: "https://api.example.test",
      modelId: "demo-model",
      apiKey: "openai-token",
    });

    assert.equal(result, "Hello world");
  } finally {
    restoreFetch();
  }
});

test("runOpenAiCompatibleChatStream yields deltas from SSE responses", async () => {
  const restoreFetch = withMockFetch(async () => sseResponse([
    'data: {"choices":[{"delta":{"content":"Hello "}}]}\n\n',
    'data: {"choices":[{"delta":{"content":"world"}}]}\n\n',
    "data: [DONE]\n\n",
  ]));

  try {
    const chunks = await collectStream(runOpenAiCompatibleChatStream(REQUEST, {
      baseUrl: "https://api.example.test",
      modelId: "demo-model",
    }));

    assert.deepEqual(chunks, ["Hello", "world"]);
  } finally {
    restoreFetch();
  }
});
