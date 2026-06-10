import { VerticalBenchmarkResult, VerticalBenchmarkSnapshot, VerticalProfile } from "@/types";
import { resolveVerticalProfile } from "@/config/vertical-registry";
import { getCustomerById } from "@/lib/services/customer-service";
import { getCurrentSla, getChangeSuccessRate, getCosts } from "@/lib/services/kpi-service";
import { getSecurityPosture } from "@/lib/services/security-service";
import { getPatchCompliance } from "@/lib/services/infrastructure-service";
import { computeVerticalBenchmark } from "@/lib/verticals/benchmark";

export async function getVerticalProfile(customerId: string): Promise<VerticalProfile> {
  const customer = await getCustomerById(customerId);
  return resolveVerticalProfile(customer?.industry ?? "");
}

export async function getVerticalBenchmark(customerId: string): Promise<VerticalBenchmarkResult> {
  const [profile, currentSla, security, changeSuccess, patches, costs] = await Promise.all([
    getVerticalProfile(customerId),
    getCurrentSla(customerId),
    getSecurityPosture(customerId),
    getChangeSuccessRate(customerId),
    getPatchCompliance(customerId),
    getCosts(customerId),
  ]);

  const patchTotals = patches.reduce(
    (acc, p) => ({ compliant: acc.compliant + p.compliant, total: acc.total + p.total }),
    { compliant: 0, total: 0 }
  );
  const patchCompliancePct =
    patchTotals.total > 0 ? (patchTotals.compliant / patchTotals.total) * 100 : 0;

  const spend = costs.reduce((sum, c) => sum + c.currentMonth, 0);
  const budget = costs.reduce((sum, c) => sum + c.budget, 0);
  const budgetVariancePct = budget > 0 ? Math.max(0, ((spend - budget) / budget) * 100) : 0;

  const snapshot: VerticalBenchmarkSnapshot = {
    currentSla,
    securityScore: security.overallScore,
    changeSuccessRate: changeSuccess.rate,
    patchCompliancePct,
    budgetVariancePct,
  };

  return computeVerticalBenchmark(profile, snapshot);
}
