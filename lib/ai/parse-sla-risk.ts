import type { AiSlaRiskAdvisorResponse, SlaRiskAdvisorItem, SlaRiskTrendPoint } from "@/types";
import { extractFirstJsonObject } from "./extract-json-object";

const VALID_TRENDS = new Set(["declining", "stable", "improving"]);
const VALID_RISKS = new Set(["high", "medium", "low"]);

function emptyResponse(): AiSlaRiskAdvisorResponse {
  return {
    services: [],
    generatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseSlaRiskResponse(raw: string): AiSlaRiskAdvisorResponse {
  const jsonObject = extractFirstJsonObject(raw);
  if (!jsonObject) {
    return emptyResponse();
  }

  try {
    const parsed = JSON.parse(jsonObject);
    if (!isRecord(parsed) || !Array.isArray(parsed.services)) {
      return emptyResponse();
    }

    const services: SlaRiskAdvisorItem[] = parsed.services
      .filter((service): service is Record<string, unknown> => isRecord(service))
      .filter((service) =>
        typeof service.serviceName === "string"
        && typeof service.uptime === "number"
        && VALID_TRENDS.has(String(service.trend))
        && VALID_RISKS.has(String(service.risk)),
      )
      .map((service) => ({
        serviceName: String(service.serviceName).slice(0, 80),
        uptime: Math.max(0, Math.min(100, Number(service.uptime))),
        trend: service.trend as SlaRiskAdvisorItem["trend"],
        risk: service.risk as SlaRiskAdvisorItem["risk"],
        note: typeof service.note === "string"
          ? service.note.replace(/\s+/g, " ").trim().slice(0, 140)
          : undefined,
      }))
      .slice(0, 5);
    const trend: SlaRiskTrendPoint[] = Array.isArray(parsed.trend)
      ? parsed.trend
          .filter((point): point is Record<string, unknown> => isRecord(point))
          .map((point) => {
            const target = toNumber(point.Target);
            const historical = toNumber(point.Historical);
            const projected = toNumber(point.Projected);

            if (typeof point.month !== "string" || target === null) {
              return null;
            }

            return {
              month: point.month.slice(0, 24),
              Target: Math.max(0, Math.min(100, target)),
              ...(historical === null ? {} : { Historical: Math.max(0, Math.min(100, historical)) }),
              ...(projected === null ? {} : { Projected: Math.max(0, Math.min(100, projected)) }),
            };
          })
          .filter((point): point is SlaRiskTrendPoint => !!point)
          .slice(0, 8)
      : [];

    return {
      services,
      trend,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return emptyResponse();
  }
}
