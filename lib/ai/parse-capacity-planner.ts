import type { AiCapacityPlannerItem, AiCapacityPlannerResponse } from "@/types";
import { extractFirstJsonObject } from "./extract-json-object";

function emptyResponse(): AiCapacityPlannerResponse {
  return {
    resources: [],
    generatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseCapacityPlannerResponse(raw: string): AiCapacityPlannerResponse {
  const jsonObject = extractFirstJsonObject(raw);
  if (!jsonObject) {
    return emptyResponse();
  }

  try {
    const parsed = JSON.parse(jsonObject);
    if (!isRecord(parsed) || !Array.isArray(parsed.resources)) {
      return emptyResponse();
    }

    const resources: AiCapacityPlannerItem[] = parsed.resources
      .filter((resource): resource is Record<string, unknown> => isRecord(resource))
      .filter((resource) =>
        typeof resource.type === "string"
        && typeof resource.current === "number"
        && typeof resource.dailyGrowth === "number"
        && typeof resource.threshold80 === "string"
        && typeof resource.threshold90 === "string"
        && typeof resource.summary === "string",
      )
      .map((resource) => ({
        type: String(resource.type).slice(0, 40),
        current: Math.max(0, Math.min(100, Number(resource.current))),
        dailyGrowth: Number(Number(resource.dailyGrowth).toFixed(2)),
        threshold80: String(resource.threshold80).slice(0, 24),
        threshold90: String(resource.threshold90).slice(0, 24),
        summary: String(resource.summary).replace(/\s+/g, " ").trim().slice(0, 110),
      }))
      .slice(0, 4);

    return {
      resources,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return emptyResponse();
  }
}
