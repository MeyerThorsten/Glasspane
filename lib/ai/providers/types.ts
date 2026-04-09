import type { ViewType } from "@/types";

export type AiProvider =
  | "mock"
  | "watsonx"
  | "openrouter"
  | "lm-studio"
  | "ollama"
  | "openai"
  | "anthropic"
  | "gemini"
  | "bedrock";

export type AiTask =
  | "summary"
  | "chat"
  | "insights"
  | "risk-briefing"
  | "sla-risk"
  | "cost-forecast"
  | "capacity-planner"
  | "root-cause-patterns"
  | "change-impact";

export interface AiTextMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiRequestMetadata {
  customerId?: string;
  view?: ViewType;
  question?: string;
}

export interface AiTextRequest {
  task: AiTask;
  messages: AiTextMessage[];
  maxTokens?: number;
  temperature?: number;
  metadata?: AiRequestMetadata;
}

export interface AiProviderClient {
  id: AiProvider;
  generateText: (request: AiTextRequest) => Promise<string>;
  streamText?: (request: AiTextRequest) => AsyncIterable<string>;
}
