"use client";

import { createElement, lazy, ComponentType } from "react";

const registry: Record<string, ComponentType> = {
  // AI widgets
  "ai-summary": lazy(() => import("@/components/ai/AiSummaryWidget")),
  "ai-anomalies": lazy(() => import("@/components/ai/AiAnomaliesWidget")),
  "ai-predictions": lazy(() => import("@/components/ai/AiPredictionsWidget")),
  "ai-risk-briefing": lazy(() => import("@/components/ai/AiRiskBriefingWidget")),
  "ai-model-transparency": lazy(() => import("@/components/ai/AiModelTransparencyWidget")),
  "ai-cost-forecast": lazy(() => import("@/components/ai/AiCostForecastWidget")),
  "ai-root-cause-patterns": lazy(() => import("@/components/ai/AiRootCausePatternsWidget")),
  "ai-sla-risk-advisor": lazy(() => import("@/components/ai/AiSlaRiskAdvisorWidget")),
  "ai-capacity-planner": lazy(() => import("@/components/ai/AiCapacityPlannerWidget")),
  "ai-change-impact": lazy(() => import("@/components/ai/AiChangeImpactWidget")),

  // Optimization
  "optimization-recommendations": lazy(() => import("@/components/widgets/OptimizationWidget")),

  // C-Level widgets
  "sla-compliance-gauge": lazy(() => import("@/components/widgets/c-level/SlaComplianceGauge")),
  "zero-outage-score": lazy(() => import("@/components/widgets/c-level/ZeroOutageScore")),
  "service-health-overview": lazy(() => import("@/components/widgets/c-level/ServiceHealthOverview")),
  "cost-overview": lazy(() => import("@/components/widgets/c-level/CostOverview")),
  "risk-score": lazy(() => import("@/components/widgets/c-level/RiskScore")),
  "major-incidents-summary": lazy(() => import("@/components/widgets/c-level/MajorIncidentsSummary")),
  "digital-transformation": lazy(() => import("@/components/widgets/c-level/DigitalTransformation")),
  "security-posture": lazy(() => import("@/components/widgets/c-level/SecurityPosture")),

  // Business widgets
  "service-utilization": lazy(() => import("@/components/widgets/business/ServiceUtilization")),
  "ticket-volume-trends": lazy(() => import("@/components/widgets/business/TicketVolumeTrends")),
  "mttr-trends": lazy(() => import("@/components/widgets/business/MttrTrends")),
  "change-success-rate": lazy(() => import("@/components/widgets/business/ChangeSuccessRate")),
  "project-delivery-status": lazy(() => import("@/components/widgets/business/ProjectDeliveryStatus")),
  "sla-compliance-by-service": lazy(() => import("@/components/widgets/business/SlaComplianceByService")),
  "top-open-issues": lazy(() => import("@/components/widgets/business/TopOpenIssues")),
  "pending-changes": lazy(() => import("@/components/widgets/business/PendingChanges")),
  "zero-outage-pillars": lazy(() => import("@/components/widgets/business/ZeroOutagePillars")),
  "service-availability-trend": lazy(() => import("@/components/widgets/business/ServiceAvailabilityTrend")),

  // Technical widgets
  "system-status-grid": lazy(() => import("@/components/widgets/technical/SystemStatusGrid")),
  "uptime-by-service": lazy(() => import("@/components/widgets/technical/UptimeByService")),
  "latency-metrics": lazy(() => import("@/components/widgets/technical/LatencyMetrics")),
  "incident-by-severity": lazy(() => import("@/components/widgets/technical/IncidentBySeverity")),
  "patch-compliance": lazy(() => import("@/components/widgets/technical/PatchCompliance")),
  "resource-utilization": lazy(() => import("@/components/widgets/technical/ResourceUtilization")),
  "network-throughput": lazy(() => import("@/components/widgets/technical/NetworkThroughput")),
  "certificate-expiry": lazy(() => import("@/components/widgets/technical/CertificateExpiry")),
  "vulnerability-summary": lazy(() => import("@/components/widgets/technical/VulnerabilitySummary")),
  "backup-success-rate": lazy(() => import("@/components/widgets/technical/BackupSuccessRate")),
  "change-calendar": lazy(() => import("@/components/widgets/technical/ChangeCalendar")),
  "error-rate-by-service": lazy(() => import("@/components/widgets/technical/ErrorRateByService")),
  "dns-resolution-time": lazy(() => import("@/components/widgets/technical/DnsResolutionTime")),
};

export function getWidgetComponent(id: string) {
  const component = registry[id];
  if (!component) {
    throw new Error(`Widget "${id}" not found in registry`);
  }
  return component;
}

export function getWidgetElement(id: string, key: string) {
  return createElement(getWidgetComponent(id), { key });
}
