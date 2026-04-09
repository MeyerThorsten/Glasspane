import { getAiConfig, getModelForTask } from "../config";
import { runOpenAiCompatibleChat, runOpenAiCompatibleChatStream } from "./openai-compatible";
import type { AiProviderClient } from "./types";

export const lmStudioProvider: AiProviderClient = {
  id: "lm-studio",
  async generateText(request) {
    const config = getAiConfig();

    return runOpenAiCompatibleChat(request, {
      baseUrl: config.lmStudio.baseUrl,
      modelId: getModelForTask("lm-studio", request.task, config),
      apiKey: config.lmStudio.apiKey || undefined,
    });
  },
  streamText(request) {
    const config = getAiConfig();

    return runOpenAiCompatibleChatStream(request, {
      baseUrl: config.lmStudio.baseUrl,
      modelId: getModelForTask("lm-studio", request.task, config),
      apiKey: config.lmStudio.apiKey || undefined,
    });
  },
};
