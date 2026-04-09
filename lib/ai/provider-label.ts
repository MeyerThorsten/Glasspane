import type { AiProvider } from "./providers/types";

const PROVIDER_LABELS: Record<AiProvider, string> = {
  mock: "Mock AI",
  watsonx: "IBM watsonx.ai",
  openrouter: "OpenRouter",
  "lm-studio": "LM Studio",
  ollama: "Ollama",
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Google Gemini",
  bedrock: "Amazon Bedrock",
};

export function getAiProviderLabel(provider: string | undefined): string {
  if (!provider) {
    return "AI";
  }

  return PROVIDER_LABELS[provider as AiProvider] ?? "AI";
}
