import { anthropicProvider } from "./anthropic";
import { bedrockProvider } from "./bedrock";
import { geminiProvider } from "./gemini";
import { lmStudioProvider } from "./lm-studio";
import { mockProvider } from "./mock";
import { ollamaProvider } from "./ollama";
import { openaiProvider } from "./openai";
import { openrouterProvider } from "./openrouter";
import type { AiProvider, AiProviderClient } from "./types";
import { watsonxProvider } from "./watsonx";

const PROVIDERS: Record<AiProvider, AiProviderClient> = {
  mock: mockProvider,
  watsonx: watsonxProvider,
  openrouter: openrouterProvider,
  "lm-studio": lmStudioProvider,
  ollama: ollamaProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  bedrock: bedrockProvider,
};

export function getProviderClient(provider: AiProvider): AiProviderClient {
  return PROVIDERS[provider];
}
