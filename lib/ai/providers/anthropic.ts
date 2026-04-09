import { getAiConfig, getModelForTask } from "../config";
import type { AiProviderClient, AiTextMessage } from "./types";

interface AnthropicResponse {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
}

function splitSystemMessages(messages: AiTextMessage[]) {
  const systemMessages = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter(Boolean);

  const conversation = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }));

  return {
    system: systemMessages.join("\n\n"),
    conversation,
  };
}

export const anthropicProvider: AiProviderClient = {
  id: "anthropic",
  async generateText(request) {
    const config = getAiConfig();
    const { system, conversation } = splitSystemMessages(request.messages);

    const response = await fetch(`${config.anthropic.baseUrl.replace(/\/$/, "")}/messages`, {
      method: "POST",
      headers: {
        "x-api-key": config.anthropic.apiKey,
        "anthropic-version": config.anthropic.version,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: getModelForTask("anthropic", request.task, config),
        max_tokens: request.maxTokens ?? 300,
        temperature: request.temperature ?? 0.3,
        ...(system ? { system } : {}),
        messages: conversation,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic messages failed (${response.status}): ${text}`);
    }

    const data = await response.json() as AnthropicResponse;
    return (data.content ?? [])
      .filter((item) => item.type === "text" && item.text)
      .map((item) => item.text?.trim() || "")
      .join("\n")
      .trim();
  },
};
