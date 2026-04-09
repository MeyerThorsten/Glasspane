import type { AiRiskBriefingResponse, RiskBriefingItem } from "@/types";
import { extractFirstJsonObject } from "./extract-json-object";

const VALID_SEVERITIES = new Set(["critical", "warning", "info"]);

function emptyResponse(): AiRiskBriefingResponse {
  return {
    items: [],
    generatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRiskBriefingResponse(raw: string): AiRiskBriefingResponse {
  const jsonObject = extractFirstJsonObject(raw);
  if (!jsonObject) {
    return emptyResponse();
  }

  try {
    const parsed = JSON.parse(jsonObject);
    if (!isRecord(parsed) || !Array.isArray(parsed.items)) {
      return emptyResponse();
    }

    const items: RiskBriefingItem[] = parsed.items
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .filter((item) => typeof item.id === "string"
        && typeof item.text === "string"
        && VALID_SEVERITIES.has(String(item.severity)))
      .map((item) => ({
        id: item.id as string,
        severity: item.severity as RiskBriefingItem["severity"],
        text: String(item.text).replace(/\s+/g, " ").trim().slice(0, 180),
      }))
      .filter((item) => item.text.length > 0)
      .slice(0, 4);

    return {
      items,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return emptyResponse();
  }
}
