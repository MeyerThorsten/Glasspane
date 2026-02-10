export type VulnerabilitySeverity = "critical" | "high" | "medium" | "low";

export interface VulnerabilitySummary {
  severity: VulnerabilitySeverity;
  count: number;
}

export interface SecurityPosture {
  overallScore: number;
  vulnerabilities: VulnerabilitySummary[];
  topCves: { id: string; severity: VulnerabilitySeverity; affected: string; description: string }[];
}
