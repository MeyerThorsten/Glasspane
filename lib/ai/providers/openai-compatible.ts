import { readSseEvents } from "../sse";
import type { AiTextRequest } from "./types";

interface OpenAiCompatibleOptions {
  baseUrl: string;
  modelId: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

interface OpenAiCompatibleResponse {
  choices?: Array<{
    delta?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

type OpenAiMessageContent = string | Array<{ type?: string; text?: string }> | undefined;

function normalizeContent(content: OpenAiMessageContent): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text || "")
      .join("")
      .trim();
  }

  return "";
}

export async function runOpenAiCompatibleChat(
  request: AiTextRequest,
  options: OpenAiCompatibleOptions,
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (options.apiKey) {
    headers.Authorization = `Bearer ${options.apiKey}`;
  }

  const response = await fetch(`${options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: options.modelId,
      messages: request.messages,
      max_tokens: request.maxTokens ?? 300,
      temperature: request.temperature ?? 0.3,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI-compatible chat failed (${response.status}): ${text}`);
  }

  const data = await response.json() as OpenAiCompatibleResponse;
  return normalizeContent(data.choices?.[0]?.message?.content);
}

export async function* runOpenAiCompatibleChatStream(
  request: AiTextRequest,
  options: OpenAiCompatibleOptions,
): AsyncGenerator<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (options.apiKey) {
    headers.Authorization = `Bearer ${options.apiKey}`;
  }

  const response = await fetch(`${options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: options.modelId,
      messages: request.messages,
      max_tokens: request.maxTokens ?? 300,
      temperature: request.temperature ?? 0.3,
      stream: true,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI-compatible chat failed (${response.status}): ${text}`);
  }

  if (!response.body) {
    return;
  }

  for await (const event of readSseEvents(response.body)) {
    if (event.data === "[DONE]") {
      return;
    }

    const data = JSON.parse(event.data) as OpenAiCompatibleResponse;
    const delta = normalizeContent(
      data.choices?.[0]?.delta?.content ?? data.choices?.[0]?.message?.content,
    );

    if (delta) {
      yield delta;
    }
  }
}
