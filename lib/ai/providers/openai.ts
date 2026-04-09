import { getAiConfig, getModelForTask } from "../config";
import { runOpenAiCompatibleChat, runOpenAiCompatibleChatStream } from "./openai-compatible";
import type { AiProviderClient } from "./types";

export const openaiProvider: AiProviderClient = {
  id: "openai",
  async generateText(request) {
    const config = getAiConfig();

    return runOpenAiCompatibleChat(request, {
      baseUrl: config.openai.baseUrl,
      modelId: getModelForTask("openai", request.task, config),
      apiKey: config.openai.apiKey,
    });
  },
  streamText(request) {
    const config = getAiConfig();

    return runOpenAiCompatibleChatStream(request, {
      baseUrl: config.openai.baseUrl,
      modelId: getModelForTask("openai", request.task, config),
      apiKey: config.openai.apiKey,
    });
  },
};
