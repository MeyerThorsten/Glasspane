export type AnomalySeverity = "info" | "warning" | "critical";

export interface Anomaly {
  id: string;
  metric: string;
  widgetId: string;
  severity: AnomalySeverity;
  title: string;
  description: string;
  timestamp?: string;
  dateRange?: { from: string; to: string };
}

export type PredictionCategory = "sla" | "cost" | "capacity";

export interface Prediction {
  id: string;
  category: PredictionCategory;
  title: string;
  description: string;
  confidence: "low" | "medium" | "high";
  timeframe: string;
  metric?: string;
  widgetId?: string;
}

export interface AiInsightsResponse {
  anomalies: Anomaly[];
  predictions: Prediction[];
  generatedAt: string;
  providerLabel?: string;
  modelInfo?: AiModelInfo;
}

export type RiskBriefingSeverity = "critical" | "warning" | "info";

export interface RiskBriefingItem {
  id: string;
  severity: RiskBriefingSeverity;
  text: string;
}

export interface AiRiskBriefingResponse {
  items: RiskBriefingItem[];
  generatedAt: string;
  providerLabel?: string;
  modelInfo?: AiModelInfo;
}

export type SlaRiskTrend = "declining" | "stable" | "improving";
export type SlaRiskLevel = "high" | "medium" | "low";

export interface SlaRiskAdvisorItem {
  serviceName: string;
  uptime: number;
  trend: SlaRiskTrend;
  risk: SlaRiskLevel;
  note?: string;
}

export interface AiSlaRiskAdvisorResponse {
  services: SlaRiskAdvisorItem[];
  trend?: SlaRiskTrendPoint[];
  generatedAt: string;
  providerLabel?: string;
  modelInfo?: AiModelInfo;
}

export interface AiCostForecastPoint {
  month: string;
  Projected: number;
  Optimistic: number;
  Pessimistic: number;
  Budget: number;
}

export interface AiCostHistoryPoint {
  month: string;
  Actual: number;
  Budget: number;
}

export interface AiCostForecastResponse {
  summary: string;
  history?: AiCostHistoryPoint[];
  forecast: AiCostForecastPoint[];
  generatedAt: string;
  providerLabel?: string;
  modelInfo?: AiModelInfo;
}

export interface AiCapacityPlannerItem {
  type: string;
  current: number;
  dailyGrowth: number;
  threshold80: string;
  threshold90: string;
  summary: string;
}

export interface AiCapacityPlannerResponse {
  resources: AiCapacityPlannerItem[];
  generatedAt: string;
  providerLabel?: string;
  modelInfo?: AiModelInfo;
}

export interface AiRootCausePattern {
  id: string;
  category: string;
  percentage: number;
  description: string;
  recommendation: string;
}

export interface AiRootCausePatternsResponse {
  patterns: AiRootCausePattern[];
  generatedAt: string;
  providerLabel?: string;
  modelInfo?: AiModelInfo;
}

export interface AiChangeImpactItem {
  id: string;
  title: string;
  riskScore: number;
  affectedServices: string[];
  successRate: number;
  date: string;
  note?: string;
}

export interface AiChangeImpactResponse {
  changes: AiChangeImpactItem[];
  generatedAt: string;
  providerLabel?: string;
  modelInfo?: AiModelInfo;
}

export interface AiModelInfo {
  task: string;
  provider: string;
  providerLabel: string;
  model: string;
  version: string;
  latencyMs?: number;
  fallbackCount?: number;
  servedAt?: string;
}

export interface AiModelTelemetryEvent extends AiModelInfo {
  id: string;
  status: "success" | "error";
  error?: string;
  fallbackTo?: string;
}

export interface AiModelHealthSummary {
  id: string;
  task: string;
  provider: string;
  providerLabel: string;
  model: string;
  version: string;
  attempts: number;
  successes: number;
  errors: number;
  fallbackEvents: number;
  averageLatencyMs: number | null;
  latestLatencyMs: number | null;
  errorRate: number;
  qualityScore: number | null;
  lastSeenAt: string | null;
}

export interface AiModelTransparencyAlert {
  id: string;
  severity: "warning" | "critical";
  title: string;
  detail: string;
  task: string;
  provider: string;
  detectedAt: string;
}

export interface AiModelTransparencySnapshot {
  windowMs: number;
  generatedAt: string;
  models: AiModelHealthSummary[];
  alerts: AiModelTransparencyAlert[];
  latestEvents: AiModelTelemetryEvent[];
}

export interface SlaRiskTrendPoint {
  month: string;
  Historical?: number;
  Projected?: number;
  Target: number;
}
