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
  generatedAt: string;
  providerLabel?: string;
}

export interface AiCostForecastPoint {
  month: string;
  Projected: number;
  Optimistic: number;
  Pessimistic: number;
  Budget: number;
}

export interface AiCostForecastResponse {
  summary: string;
  forecast: AiCostForecastPoint[];
  generatedAt: string;
  providerLabel?: string;
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
}
