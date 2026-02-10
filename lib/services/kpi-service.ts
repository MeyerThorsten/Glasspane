import { MonthlySla, CostBreakdown, RiskScore } from "@/types";
import kpisData from "@/data/mock/kpis.json";

const data = kpisData as Record<string, {
  slaHistory: MonthlySla[];
  currentSla: number;
  costs: CostBreakdown[];
  risk: RiskScore;
  changeSuccessRate: number;
  changeSuccessRateTrend: string;
}>;

export async function getSlaHistory(customerId: string): Promise<MonthlySla[]> {
  return data[customerId]?.slaHistory ?? [];
}

export async function getCurrentSla(customerId: string): Promise<number> {
  return data[customerId]?.currentSla ?? 0;
}

export async function getCosts(customerId: string): Promise<CostBreakdown[]> {
  return data[customerId]?.costs ?? [];
}

export async function getRisk(customerId: string): Promise<RiskScore> {
  return data[customerId]?.risk ?? { overall: 0, high: 0, medium: 0, low: 0, trend: "stable" };
}

export async function getChangeSuccessRate(customerId: string): Promise<{ rate: number; trend: string }> {
  const d = data[customerId];
  return { rate: d?.changeSuccessRate ?? 0, trend: d?.changeSuccessRateTrend ?? "stable" };
}
