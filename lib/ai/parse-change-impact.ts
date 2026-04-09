import type { AiChangeImpactItem, AiChangeImpactResponse } from "@/types";
import { extractFirstJsonObject } from "./extract-json-object";

function emptyResponse(): AiChangeImpactResponse {
  return {
    changes: [],
    generatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseChangeImpactResponse(raw: string): AiChangeImpactResponse {
  const jsonObject = extractFirstJsonObject(raw);
  if (!jsonObject) {
    return emptyResponse();
  }

  try {
    const parsed = JSON.parse(jsonObject);
    if (!isRecord(parsed) || !Array.isArray(parsed.changes)) {
      return emptyResponse();
    }

    const changes: AiChangeImpactItem[] = parsed.changes
      .filter((change): change is Record<string, unknown> => isRecord(change))
      .filter((change) =>
        typeof change.id === "string"
        && typeof change.title === "string"
        && typeof change.riskScore === "number"
        && Array.isArray(change.affectedServices)
        && typeof change.successRate === "number"
        && typeof change.date === "string",
      )
      .map((change) => ({
        id: String(change.id),
        title: String(change.title).slice(0, 90),
        riskScore: Math.max(1, Math.min(5, Math.round(Number(change.riskScore)))),
        affectedServices: (change.affectedServices as unknown[])
          .filter((service): service is string => typeof service === "string")
          .map((service) => service.slice(0, 50))
          .slice(0, 4),
        successRate: Math.max(0, Math.min(100, Math.round(Number(change.successRate)))),
        date: String(change.date).slice(0, 24),
        note: typeof change.note === "string"
          ? change.note.replace(/\s+/g, " ").trim().slice(0, 120)
          : undefined,
      }))
      .slice(0, 5);

    return {
      changes,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return emptyResponse();
  }
}
