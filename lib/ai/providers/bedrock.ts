import { getAiConfig, getModelForTask } from "../config";
import { runOpenAiCompatibleChat, runOpenAiCompatibleChatStream } from "./openai-compatible";
import type { AiProviderClient } from "./types";

export const bedrockProvider: AiProviderClient = {
  id: "bedrock",
  async generateText(request) {
    const config = getAiConfig();

    return runOpenAiCompatibleChat(request, {
      baseUrl: config.bedrock.baseUrl,
      modelId: getModelForTask("bedrock", request.task, config),
      apiKey: config.bedrock.apiKey,
    });
  },
  streamText(request) {
    const config = getAiConfig();

    return runOpenAiCompatibleChatStream(request, {
      baseUrl: config.bedrock.baseUrl,
      modelId: getModelForTask("bedrock", request.task, config),
      apiKey: config.bedrock.apiKey,
    });
  },
};
