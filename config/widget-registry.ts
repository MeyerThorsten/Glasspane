"use client";

import { lazy, ComponentType } from "react";

const registry: Record<string, () => Promise<{ default: ComponentType }>> = {
  // AI widgets
  "ai-summary": () => import("@/components/ai/AiSummaryWidget"),
  "ai-anomalies": () => import("@/components/ai/AiAnomaliesWidget"),
  "ai-predictions": () => import("@/components/ai/AiPredictionsWidget"),

  // C-Level widgets
  "sla-compliance-gauge": () => import("@/components/widgets/c-level/SlaComplianceGauge"),
  "zero-outage-score": () => import("@/components/widgets/c-level/ZeroOutageScore"),
  "service-health-overview": () => import("@/components/widgets/c-level/ServiceHealthOverview"),
  "cost-overview": () => import("@/components/widgets/c-level/CostOverview"),
  "risk-score": () => import("@/components/widgets/c-level/RiskScore"),
  "major-incidents-summary": () => import("@/components/widgets/c-level/MajorIncidentsSummary"),
  "digital-transformation": () => import("@/components/widgets/c-level/DigitalTransformation"),
  "security-posture": () => import("@/components/widgets/c-level/SecurityPosture"),

  // Business widgets
  "service-utilization": () => import("@/components/widgets/business/ServiceUtilization"),
  "ticket-volume-trends": () => import("@/components/widgets/business/TicketVolumeTrends"),
  "mttr-trends": () => import("@/components/widgets/business/MttrTrends"),
  "change-success-rate": () => import("@/components/widgets/business/ChangeSuccessRate"),
  "project-delivery-status": () => import("@/components/widgets/business/ProjectDeliveryStatus"),
  "sla-compliance-by-service": () => import("@/components/widgets/business/SlaComplianceByService"),
  "top-open-issues": () => import("@/components/widgets/business/TopOpenIssues"),
  "pending-changes": () => import("@/components/widgets/business/PendingChanges"),
  "zero-outage-pillars": () => import("@/components/widgets/business/ZeroOutagePillars"),
  "service-availability-trend": () => import("@/components/widgets/business/ServiceAvailabilityTrend"),

  // Technical widgets
  "system-status-grid": () => import("@/components/widgets/technical/SystemStatusGrid"),
  "uptime-by-service": () => import("@/components/widgets/technical/UptimeByService"),
  "latency-metrics": () => import("@/components/widgets/technical/LatencyMetrics"),
  "incident-by-severity": () => import("@/components/widgets/technical/IncidentBySeverity"),
  "patch-compliance": () => import("@/components/widgets/technical/PatchCompliance"),
  "resource-utilization": () => import("@/components/widgets/technical/ResourceUtilization"),
  "network-throughput": () => import("@/components/widgets/technical/NetworkThroughput"),
  "certificate-expiry": () => import("@/components/widgets/technical/CertificateExpiry"),
  "vulnerability-summary": () => import("@/components/widgets/technical/VulnerabilitySummary"),
  "backup-success-rate": () => import("@/components/widgets/technical/BackupSuccessRate"),
  "change-calendar": () => import("@/components/widgets/technical/ChangeCalendar"),
  "error-rate-by-service": () => import("@/components/widgets/technical/ErrorRateByService"),
  "dns-resolution-time": () => import("@/components/widgets/technical/DnsResolutionTime"),
};

const componentCache = new Map<string, ReturnType<typeof lazy>>();

export function getWidgetComponent(id: string) {
  const cached = componentCache.get(id);
  if (cached) return cached;

  const loader = registry[id];
  if (!loader) {
    throw new Error(`Widget "${id}" not found in registry`);
  }
  const component = lazy(loader);
  componentCache.set(id, component);
  return component;
}
