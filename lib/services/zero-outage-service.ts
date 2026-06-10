import { ZeroOutageScore, DigitalTransformationMilestone } from "@/types";
import zeroOutageData from "@/data/mock/zero-outage.json";
import infraData from "@/data/mock/infrastructure.json";
import { computeZeroOutageScore, ZeroOutageSignals } from "@/lib/zero-outage/compute";
import { getCurrentSla, getChangeSuccessRate, getSlaHistory } from "@/lib/services/kpi-service";
import { getMttrTrends } from "@/lib/services/incident-service";
import { getPatchCompliance, getBackups } from "@/lib/services/infrastructure-service";
import { getSecurityPosture } from "@/lib/services/security-service";
import { getWorkforceEmployees } from "@/lib/services/workforce-service";

const zoData = zeroOutageData as Record<string, ZeroOutageScore>;
const infra = infraData as Record<string, { digitalTransformation: DigitalTransformationMilestone[] }>;

export async function getZeroOutageScore(customerId: string): Promise<ZeroOutageScore> {
  return zoData[customerId] ?? { overall: 0, target: 0, pillars: [] };
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export async function getComputedZeroOutageScore(customerId: string): Promise<ZeroOutageScore> {
  const [employees, changeSuccess, mttrTrends, patches, backups, currentSla, slaHistory, security] =
    await Promise.all([
      getWorkforceEmployees(),
      getChangeSuccessRate(customerId),
      getMttrTrends(customerId),
      getPatchCompliance(customerId),
      getBackups(customerId),
      getCurrentSla(customerId),
      getSlaHistory(customerId),
      getSecurityPosture(customerId),
    ]);

  const patchTotals = patches.reduce(
    (acc, p) => ({ compliant: acc.compliant + p.compliant, total: acc.total + p.total }),
    { compliant: 0, total: 0 }
  );
  const recentMttr = mttrTrends.slice(-3).map((t) => t.p1);

  const signals: ZeroOutageSignals = {
    engagementAvg: avg(employees.map((e) => e.engagementScore)),
    opportunityReadinessAvg: avg(employees.map((e) => e.opportunityReadiness)),
    changeSuccessRate: changeSuccess.rate,
    mttrP1AvgMinutes: avg(recentMttr),
    patchCompliancePct:
      patchTotals.total > 0 ? (patchTotals.compliant / patchTotals.total) * 100 : null,
    currentSla: currentSla > 0 ? currentSla : null,
    slaTarget: slaHistory[0]?.target ?? 99.9,
    securityScore: security.overallScore > 0 ? security.overallScore : null,
    backupSuccessAvg: avg(backups.map((b) => b.successRate)),
  };

  return computeZeroOutageScore(signals) ?? getZeroOutageScore(customerId);
}

export async function getDigitalTransformation(customerId: string): Promise<DigitalTransformationMilestone[]> {
  return infra[customerId]?.digitalTransformation ?? [];
}
