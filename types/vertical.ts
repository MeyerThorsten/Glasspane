import { ServiceCategory } from "./customer";

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
}

export interface VerticalBenchmarks {
  slaTarget: number;
  securityScoreTarget: number;
  changeSuccessTarget: number;
  patchComplianceTarget: number;
  budgetVarianceTolerancePct: number;
}

export interface VerticalProfile {
  id: string;
  label: string;
  industries: string[];
  priorityCategories: ServiceCategory[];
  complianceFrameworks: ComplianceFramework[];
  benchmarks: VerticalBenchmarks;
  keyRisks: string[];
}

export type BenchmarkStatus = "ahead" | "on-par" | "behind";

export interface BenchmarkMetricResult {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  status: BenchmarkStatus;
}

export interface VerticalBenchmarkSnapshot {
  currentSla: number;
  securityScore: number;
  changeSuccessRate: number;
  patchCompliancePct: number;
  budgetVariancePct: number;
}

export interface VerticalBenchmarkResult {
  profile: VerticalProfile;
  metrics: BenchmarkMetricResult[];
  aheadCount: number;
  behindCount: number;
}
