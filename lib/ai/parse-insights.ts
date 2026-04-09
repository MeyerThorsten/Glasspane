import type { AiInsightsResponse, Anomaly, Prediction } from "@/types";
import { extractFirstJsonObject } from "./extract-json-object";

const VALID_SEVERITIES = new Set(["info", "warning", "critical"]);
const VALID_CATEGORIES = new Set(["sla", "cost", "capacity"]);
const VALID_CONFIDENCES = new Set(["low", "medium", "high"]);

export function parseInsightsResponse(raw: string): AiInsightsResponse {
  const jsonObject = extractFirstJsonObject(raw);
  if (!jsonObject) {
    return { anomalies: [], predictions: [], generatedAt: new Date().toISOString() };
  }

  try {
    const parsed = JSON.parse(jsonObject);

    const anomalies: Anomaly[] = (parsed.anomalies ?? [])
      .filter((a: Record<string, unknown>) =>
        a.id && a.metric && a.widgetId && a.title && a.description &&
        VALID_SEVERITIES.has(a.severity as string)
      )
      .map((a: Record<string, unknown>) => ({
        id: String(a.id),
        metric: String(a.metric),
        widgetId: String(a.widgetId),
        severity: a.severity as Anomaly["severity"],
        title: String(a.title).slice(0, 80),
        description: String(a.description).slice(0, 300),
      }));

    const predictions: Prediction[] = (parsed.predictions ?? [])
      .filter((p: Record<string, unknown>) =>
        p.id && p.title && p.description &&
        VALID_CATEGORIES.has(p.category as string) &&
        VALID_CONFIDENCES.has(p.confidence as string)
      )
      .map((p: Record<string, unknown>) => ({
        id: String(p.id),
        category: p.category as Prediction["category"],
        title: String(p.title).slice(0, 80),
        description: String(p.description).slice(0, 300),
        confidence: p.confidence as Prediction["confidence"],
        timeframe: String(p.timeframe || "next 30 days"),
        metric: p.metric ? String(p.metric) : undefined,
        widgetId: p.widgetId ? String(p.widgetId) : undefined,
      }));

    return { anomalies, predictions, generatedAt: new Date().toISOString() };
  } catch {
    return { anomalies: [], predictions: [], generatedAt: new Date().toISOString() };
  }
}
