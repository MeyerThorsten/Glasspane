import { getAiConfig, getModelForTask } from "../config";
import { readSseEvents } from "../sse";
import type { AiProviderClient, AiTextMessage } from "./types";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

type GeminiContent = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

function splitGeminiMessages(messages: AiTextMessage[]) {
  const systemInstruction = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n\n");

  const contents = messages
    .filter((message) => message.role !== "system")
    .map<GeminiContent>((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

  return {
    systemInstruction,
    contents,
  };
}

function extractGeminiText(payload: GeminiResponse): string {
  return (payload.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text?.trim() || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function buildGeminiBody(
  systemInstruction: string,
  contents: GeminiContent[],
  maxTokens: number,
  temperature: number,
) {
  return {
    ...(systemInstruction
      ? {
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
        }
      : {}),
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };
}

export const geminiProvider: AiProviderClient = {
  id: "gemini",
  async generateText(request) {
    const config = getAiConfig();
    const { systemInstruction, contents } = splitGeminiMessages(request.messages);
    const modelId = getModelForTask("gemini", request.task, config);
    const response = await fetch(
      `${config.gemini.baseUrl.replace(/\/$/, "")}/models/${modelId}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": config.gemini.apiKey,
        },
        body: JSON.stringify(
          buildGeminiBody(
            systemInstruction,
            contents,
            request.maxTokens ?? 300,
            request.temperature ?? 0.3,
          ),
        ),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini generateContent failed (${response.status}): ${text}`);
    }

    const data = await response.json() as GeminiResponse;
    return extractGeminiText(data);
  },
  streamText(request) {
    const config = getAiConfig();
    const { systemInstruction, contents } = splitGeminiMessages(request.messages);
    const modelId = getModelForTask("gemini", request.task, config);

    return (async function* () {
      const response = await fetch(
        `${config.gemini.baseUrl.replace(/\/$/, "")}/models/${modelId}:streamGenerateContent?alt=sse`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": config.gemini.apiKey,
          },
          body: JSON.stringify(
            buildGeminiBody(
              systemInstruction,
              contents,
              request.maxTokens ?? 300,
              request.temperature ?? 0.3,
            ),
          ),
          cache: "no-store",
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gemini streamGenerateContent failed (${response.status}): ${text}`);
      }

      if (!response.body) {
        return;
      }

      for await (const event of readSseEvents(response.body)) {
        const delta = extractGeminiText(JSON.parse(event.data) as GeminiResponse);
        if (delta) {
          yield delta;
        }
      }
    })();
  },
};
