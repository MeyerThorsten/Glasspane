import { getAiConfig, getModelForTask } from "../config";
import { getIamToken } from "../token";
import type { AiProviderClient } from "./types";

interface WatsonxChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export const watsonxProvider: AiProviderClient = {
  id: "watsonx",
  async generateText(request) {
    const config = getAiConfig();
    const token = await getIamToken(config.watsonx.apiKey);
    const url = `https://${config.watsonx.region}.ml.cloud.ibm.com/ml/v1/text/chat?version=2025-02-06`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model_id: getModelForTask("watsonx", request.task, config),
        project_id: config.watsonx.projectId,
        messages: request.messages,
        max_tokens: request.maxTokens ?? 300,
        temperature: request.temperature ?? 0.3,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`watsonx.ai chat failed (${response.status}): ${text}`);
    }

    const data = await response.json() as WatsonxChatResponse;
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  },
};
