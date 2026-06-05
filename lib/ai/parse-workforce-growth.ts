import type { AiWorkforceGrowthResponse, WorkforceGrowthRecommendation } from "@/types";
import { extractFirstJsonObject } from "./extract-json-object";

const VALID_CONFIDENCE = new Set(["low", "medium", "high"]);

function emptyResponse(employeeId: string): AiWorkforceGrowthResponse {
  return {
    employeeId,
    recommendations: [],
    generatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringList(value: unknown, limit: number): string[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .map((item) => item.replace(/\s+/g, " ").trim().slice(0, 140))
        .slice(0, limit)
    : [];
}

export function parseWorkforceGrowthResponse(raw: string, employeeId: string): AiWorkforceGrowthResponse {
  const jsonObject = extractFirstJsonObject(raw);
  if (!jsonObject) {
    return emptyResponse(employeeId);
  }

  try {
    const parsed = JSON.parse(jsonObject);
    if (!isRecord(parsed) || !Array.isArray(parsed.recommendations)) {
      return emptyResponse(employeeId);
    }

    const recommendations: WorkforceGrowthRecommendation[] = parsed.recommendations
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .filter((item) =>
        typeof item.id === "string"
        && typeof item.title === "string"
        && typeof item.rationale === "string"
        && VALID_CONFIDENCE.has(String(item.confidence)),
      )
      .map((item) => ({
        id: String(item.id).slice(0, 80),
        title: String(item.title).replace(/\s+/g, " ").trim().slice(0, 90),
        rationale: String(item.rationale).replace(/\s+/g, " ").trim().slice(0, 180),
        actions: stringList(item.actions, 4),
        sources: stringList(item.sources, 5),
        confidence: item.confidence as WorkforceGrowthRecommendation["confidence"],
      }))
      .slice(0, 4);

    return {
      employeeId: typeof parsed.employeeId === "string" ? parsed.employeeId : employeeId,
      recommendations,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return emptyResponse(employeeId);
  }
}
