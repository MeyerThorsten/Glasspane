import type { ViewType } from "@/types";
import { buildSummaryMessages, buildChatMessages } from "./prompts";
import type { ChatMessage } from "./prompts";
import { createAiCache } from "./cache";
import { gatherContext } from "./gather-context";
import { executeTextForTask, executeTextStreamForTask, getPrimaryProviderForTask } from "./router";
import type { AiProvider } from "./providers/types";

export interface GeneratedTextResult {
  text: string;
  provider: AiProvider;
  providerLabel: string;
}

export interface GeneratedTextStreamResult {
  provider: AiProvider;
  providerLabel: string;
  stream: AsyncIterable<string>;
}

const summaryCache = createAiCache<GeneratedTextResult>("summary");
const SUMMARY_CACHE_TTL = 5 * 60 * 1000;

export async function generateSummary(customerId: string, view: ViewType): Promise<GeneratedTextResult> {
  const cacheKey = `${getPrimaryProviderForTask("summary")}|${customerId}|${view}`;
  return summaryCache.remember(cacheKey, SUMMARY_CACHE_TTL, async () => {
    const context = await gatherContext(customerId, view);
    const messages = buildSummaryMessages(view, context);
    const result = await executeTextForTask("summary", {
      messages,
      maxTokens: 250,
      temperature: 0.3,
      metadata: { customerId, view },
    });

    return {
      text: result.text,
      provider: result.provider,
      providerLabel: result.providerLabel,
    };
  });
}

export async function generateChatResponse(
  customerId: string,
  view: ViewType,
  question: string,
  history: ChatMessage[],
): Promise<GeneratedTextResult> {
  const context = await gatherContext(customerId, view);
  const messages = buildChatMessages(view, context, question, history);
  const result = await executeTextForTask("chat", {
    messages,
    maxTokens: 300,
    temperature: 0.3,
    metadata: { customerId, view, question },
  });
  return {
    text: result.text,
    provider: result.provider,
    providerLabel: result.providerLabel,
  };
}

export async function streamChatResponse(
  customerId: string,
  view: ViewType,
  question: string,
  history: ChatMessage[],
): Promise<GeneratedTextStreamResult> {
  const context = await gatherContext(customerId, view);
  const messages = buildChatMessages(view, context, question, history);
  const result = await executeTextStreamForTask("chat", {
    messages,
    maxTokens: 300,
    temperature: 0.3,
    metadata: { customerId, view, question },
  });

  return {
    provider: result.provider,
    providerLabel: result.providerLabel,
    stream: result.stream,
  };
}
