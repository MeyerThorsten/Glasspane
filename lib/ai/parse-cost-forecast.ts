import type { AiCostForecastPoint, AiCostForecastResponse } from "@/types";
import { extractFirstJsonObject } from "./extract-json-object";

function emptyResponse(): AiCostForecastResponse {
  return {
    summary: "",
    forecast: [],
    generatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseCostForecastResponse(raw: string): AiCostForecastResponse {
  const jsonObject = extractFirstJsonObject(raw);
  if (!jsonObject) {
    return emptyResponse();
  }

  try {
    const parsed = JSON.parse(jsonObject);
    if (!isRecord(parsed) || !Array.isArray(parsed.forecast)) {
      return emptyResponse();
    }

    const forecast: AiCostForecastPoint[] = parsed.forecast
      .filter((point): point is Record<string, unknown> => isRecord(point))
      .map((point) => {
        const projected = toNumber(point.Projected);
        const optimistic = toNumber(point.Optimistic);
        const pessimistic = toNumber(point.Pessimistic);
        const budget = toNumber(point.Budget);

        if (
          typeof point.month !== "string"
          || projected === null
          || optimistic === null
          || pessimistic === null
          || budget === null
        ) {
          return null;
        }

        return {
          month: point.month.slice(0, 24),
          Projected: Math.round(projected),
          Optimistic: Math.round(optimistic),
          Pessimistic: Math.round(pessimistic),
          Budget: Math.round(budget),
        };
      })
      .filter((point): point is AiCostForecastPoint => !!point)
      .slice(0, 3);

    return {
      summary: typeof parsed.summary === "string"
        ? parsed.summary.replace(/\s+/g, " ").trim().slice(0, 170)
        : "",
      forecast,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return emptyResponse();
  }
}
