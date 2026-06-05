import test from "node:test";
import assert from "node:assert/strict";
import { bedrockProvider } from "../../../lib/ai/providers/bedrock.ts";
import { lmStudioProvider } from "../../../lib/ai/providers/lm-studio.ts";
import { mockProvider } from "../../../lib/ai/providers/mock.ts";
import { ollamaProvider } from "../../../lib/ai/providers/ollama.ts";
import { openaiProvider } from "../../../lib/ai/providers/openai.ts";
import { openrouterProvider } from "../../../lib/ai/providers/openrouter.ts";
import { jsonResponse, withEnv, withMockFetch } from "../test-helpers.mts";

const REQUEST = {
  task: "summary",
  messages: [{ role: "user", content: "Summarize this" }],
};

const COMPATIBLE_CASES = [
  {
    name: "openai",
    provider: openaiProvider,
    env: {
      OPENAI_API_KEY: "openai-key",
      OPENAI_BASE_URL: "https://openai.example.test/v1",
      OPENAI_MODEL_ID: "openai-demo",
    },
    url: "https://openai.example.test/v1/chat/completions",
    model: "openai-demo",
    authorization: "Bearer openai-key",
  },
  {
    name: "openrouter",
    provider: openrouterProvider,
    env: {
      OPENROUTER_API_KEY: "openrouter-key",
      OPENROUTER_BASE_URL: "https://openrouter.example.test/api/v1",
      OPENROUTER_MODEL_ID: "openrouter-demo",
      OPENROUTER_SITE_URL: "https://glasspane.example.test",
      OPENROUTER_APP_NAME: "Glasspane Test",
    },
    url: "https://openrouter.example.test/api/v1/chat/completions",
    model: "openrouter-demo",
    authorization: "Bearer openrouter-key",
    referer: "https://glasspane.example.test",
    title: "Glasspane Test",
  },
  {
    name: "ollama",
    provider: ollamaProvider,
    env: {
      OLLAMA_API_KEY: "ollama-key",
      OLLAMA_BASE_URL: "https://ollama.example.test/v1",
      OLLAMA_MODEL_ID: "llama-demo",
    },
    url: "https://ollama.example.test/v1/chat/completions",
    model: "llama-demo",
    authorization: "Bearer ollama-key",
  },
  {
    name: "lm-studio",
    provider: lmStudioProvider,
    env: {
      LM_STUDIO_API_KEY: "lm-key",
      LM_STUDIO_BASE_URL: "https://lm.example.test/v1",
      LM_STUDIO_MODEL_ID: "lm-demo",
    },
    url: "https://lm.example.test/v1/chat/completions",
    model: "lm-demo",
    authorization: "Bearer lm-key",
  },
  {
    name: "bedrock",
    provider: bedrockProvider,
    env: {
      BEDROCK_API_KEY: "bedrock-key",
      BEDROCK_BASE_URL: "https://bedrock.example.test/openai/v1",
      BEDROCK_MODEL_ID: "bedrock-demo",
    },
    url: "https://bedrock.example.test/openai/v1/chat/completions",
    model: "bedrock-demo",
    authorization: "Bearer bedrock-key",
  },
];

for (const testCase of COMPATIBLE_CASES) {
  test(`${testCase.name} provider passes model and headers to the OpenAI-compatible adapter`, async () => {
    const restoreEnv = withEnv(testCase.env);
    const restoreFetch = withMockFetch(async (input, init) => {
      assert.equal(String(input), testCase.url);
      const headers = init?.headers;
      assert.equal(headers?.Authorization, testCase.authorization);
      if (testCase.referer) {
        assert.equal(headers?.["HTTP-Referer"], testCase.referer);
      }
      if (testCase.title) {
        assert.equal(headers?.["X-Title"], testCase.title);
      }

      const body = JSON.parse(String(init?.body));
      assert.equal(body.model, testCase.model);
      assert.equal(body.messages[0].content, "Summarize this");

      return jsonResponse({
        choices: [{ message: { content: `${testCase.name} answer` } }],
      });
    });

    try {
      const result = await testCase.provider.generateText(REQUEST);
      assert.equal(result, `${testCase.name} answer`);
    } finally {
      restoreFetch();
      restoreEnv();
    }
  });
}

test("mock provider returns valid JSON for structured AI tasks", async () => {
  const result = await mockProvider.generateText({
    task: "cost-forecast",
    messages: [{ role: "user", content: "Forecast" }],
  });
  const parsed = JSON.parse(result);

  assert.ok(Array.isArray(parsed.forecast));
  assert.ok(Array.isArray(parsed.history));
});
