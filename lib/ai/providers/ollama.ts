import { getAiConfig, getModelForTask } from "../config";
import { runOpenAiCompatibleChat, runOpenAiCompatibleChatStream } from "./openai-compatible";
import type { AiProviderClient } from "./types";

export const ollamaProvider: AiProviderClient = {
  id: "ollama",
  async generateText(request) {
    const config = getAiConfig();

    return runOpenAiCompatibleChat(request, {
      baseUrl: config.ollama.baseUrl,
      modelId: getModelForTask("ollama", request.task, config),
      apiKey: config.ollama.apiKey || undefined,
    });
  },
  streamText(request) {
    const config = getAiConfig();

    return runOpenAiCompatibleChatStream(request, {
      baseUrl: config.ollama.baseUrl,
      modelId: getModelForTask("ollama", request.task, config),
      apiKey: config.ollama.apiKey || undefined,
    });
  },
};
