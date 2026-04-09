import type { AiRootCausePattern, AiRootCausePatternsResponse } from "@/types";
import { extractFirstJsonObject } from "./extract-json-object";

function emptyResponse(): AiRootCausePatternsResponse {
  return {
    patterns: [],
    generatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRootCausePatternsResponse(raw: string): AiRootCausePatternsResponse {
  const jsonObject = extractFirstJsonObject(raw);
  if (!jsonObject) {
    return emptyResponse();
  }

  try {
    const parsed = JSON.parse(jsonObject);
    if (!isRecord(parsed) || !Array.isArray(parsed.patterns)) {
      return emptyResponse();
    }

    const patterns: AiRootCausePattern[] = parsed.patterns
      .filter((pattern): pattern is Record<string, unknown> => isRecord(pattern))
      .filter((pattern) =>
        typeof pattern.id === "string"
        && typeof pattern.category === "string"
        && typeof pattern.percentage === "number"
        && typeof pattern.description === "string"
        && typeof pattern.recommendation === "string",
      )
      .map((pattern) => ({
        id: String(pattern.id),
        category: String(pattern.category).slice(0, 48),
        percentage: Math.max(1, Math.min(100, Math.round(Number(pattern.percentage)))),
        description: String(pattern.description).replace(/\s+/g, " ").trim().slice(0, 140),
        recommendation: String(pattern.recommendation).replace(/\s+/g, " ").trim().slice(0, 120),
      }))
      .slice(0, 4);

    return {
      patterns,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return emptyResponse();
  }
}
