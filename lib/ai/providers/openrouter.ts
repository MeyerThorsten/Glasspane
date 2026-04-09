import { getAiConfig, getModelForTask } from "../config";
import { runOpenAiCompatibleChat, runOpenAiCompatibleChatStream } from "./openai-compatible";
import type { AiProviderClient } from "./types";

export const openrouterProvider: AiProviderClient = {
  id: "openrouter",
  async generateText(request) {
    const config = getAiConfig();

    return runOpenAiCompatibleChat(request, {
      baseUrl: config.openrouter.baseUrl,
      modelId: getModelForTask("openrouter", request.task, config),
      apiKey: config.openrouter.apiKey,
      headers: {
        ...(config.openrouter.siteUrl ? { "HTTP-Referer": config.openrouter.siteUrl } : {}),
        ...(config.openrouter.appName ? { "X-Title": config.openrouter.appName } : {}),
      },
    });
  },
  streamText(request) {
    const config = getAiConfig();

    return runOpenAiCompatibleChatStream(request, {
      baseUrl: config.openrouter.baseUrl,
      modelId: getModelForTask("openrouter", request.task, config),
      apiKey: config.openrouter.apiKey,
      headers: {
        ...(config.openrouter.siteUrl ? { "HTTP-Referer": config.openrouter.siteUrl } : {}),
        ...(config.openrouter.appName ? { "X-Title": config.openrouter.appName } : {}),
      },
    });
  },
};
