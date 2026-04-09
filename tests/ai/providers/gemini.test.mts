import test from "node:test";
import assert from "node:assert/strict";
import { geminiProvider } from "../../../lib/ai/providers/gemini.ts";
import { collectStream, jsonResponse, sseResponse, withEnv, withMockFetch } from "../test-helpers.mts";

test("geminiProvider maps system instructions and user/model roles", async () => {
  const restoreEnv = withEnv({
    GEMINI_API_KEY: "gemini-key",
    GEMINI_BASE_URL: "https://gemini.example.test/v1beta",
    GEMINI_MODEL_ID: "gemini-demo",
  });
  const restoreFetch = withMockFetch(async (input, init) => {
    assert.equal(
      String(input),
      "https://gemini.example.test/v1beta/models/gemini-demo:generateContent",
    );
    assert.equal(init?.headers?.["x-goog-api-key"], "gemini-key");

    const body = JSON.parse(String(init?.body));
    assert.equal(body.system_instruction.parts[0].text, "Act like an analyst.");
    assert.deepEqual(body.contents, [
      { role: "user", parts: [{ text: "Hello" }] },
      { role: "model", parts: [{ text: "Hi" }] },
      { role: "user", parts: [{ text: "Explain" }] },
    ]);

    return jsonResponse({
      candidates: [{ content: { parts: [{ text: "Gemini answer" }] } }],
    });
  });

  try {
    const result = await geminiProvider.generateText({
      task: "chat",
      messages: [
        { role: "system", content: "Act like an analyst." },
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi" },
        { role: "user", content: "Explain" },
      ],
    });

    assert.equal(result, "Gemini answer");
  } finally {
    restoreFetch();
    restoreEnv();
  }
});

test("geminiProvider.streamText yields text deltas from SSE", async () => {
  const restoreEnv = withEnv({
    GEMINI_API_KEY: "gemini-key",
    GEMINI_BASE_URL: "https://gemini.example.test/v1beta",
    GEMINI_MODEL_ID: "gemini-demo",
  });
  const restoreFetch = withMockFetch(async (input) => {
    assert.equal(
      String(input),
      "https://gemini.example.test/v1beta/models/gemini-demo:streamGenerateContent?alt=sse",
    );

    return sseResponse([
      'data: {"candidates":[{"content":{"parts":[{"text":"Hello "}]} }]}\n\n',
      'data: {"candidates":[{"content":{"parts":[{"text":"world"}]} }]}\n\n',
    ]);
  });

  try {
    const chunks = await collectStream(
      geminiProvider.streamText?.({
        task: "chat",
        messages: [{ role: "user", content: "Explain" }],
      }) ?? [],
    );

    assert.deepEqual(chunks, ["Hello", "world"]);
  } finally {
    restoreFetch();
    restoreEnv();
  }
});
