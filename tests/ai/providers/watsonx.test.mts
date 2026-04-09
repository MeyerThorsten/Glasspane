import test from "node:test";
import assert from "node:assert/strict";
import { watsonxProvider } from "../../../lib/ai/providers/watsonx.ts";
import { clearAiCache } from "../../../lib/ai/cache.ts";
import { jsonResponse, withEnv, withMockFetch } from "../test-helpers.mts";

test("watsonxProvider exchanges IAM tokens once and reuses the cached token", async () => {
  const requests = [];
  const restoreEnv = withEnv({
    WATSONX_API_KEY: "ibm-api-key",
    WATSONX_PROJECT_ID: "project-1",
    WATSONX_REGION: "us-south",
    WATSONX_MODEL_ID: "ibm/granite-demo",
  });
  await clearAiCache("watsonx-token");

  const restoreFetch = withMockFetch(async (input, init) => {
    requests.push({ url: String(input), body: init?.body ? String(init.body) : "" });

    if (String(input) === "https://iam.cloud.ibm.com/identity/token") {
      return jsonResponse({ access_token: "iam-token-1" });
    }

    assert.equal(
      String(input),
      "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2025-02-06",
    );
    assert.equal(init?.headers?.Authorization, "Bearer iam-token-1");

    const body = JSON.parse(String(init?.body));
    assert.equal(body.project_id, "project-1");
    assert.equal(body.model_id, "ibm/granite-demo");

    return jsonResponse({
      choices: [{ message: { content: "watsonx answer" } }],
    });
  });

  try {
    const request = {
      task: "summary",
      messages: [{ role: "user", content: "Summarize" }],
    };

    const first = await watsonxProvider.generateText(request);
    const second = await watsonxProvider.generateText(request);

    assert.equal(first, "watsonx answer");
    assert.equal(second, "watsonx answer");
    assert.equal(
      requests.filter((request) => request.url === "https://iam.cloud.ibm.com/identity/token").length,
      1,
    );
  } finally {
    restoreFetch();
    restoreEnv();
    await clearAiCache("watsonx-token");
  }
});
