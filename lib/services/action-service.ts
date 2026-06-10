import { RecommendedAction } from "@/types";
import { getVerticalProfile } from "@/lib/services/vertical-service";
import { getCurrentSla, getChangeSuccessRate, getCosts, getSlaHistory } from "@/lib/services/kpi-service";
import { getOpenIncidents } from "@/lib/services/incident-service";
import { getCertificates, getPatchCompliance, getBackups } from "@/lib/services/infrastructure-service";
import { getSecurityPosture } from "@/lib/services/security-service";
import { evaluateActionRules } from "@/lib/actions/rules";

export async function getRecommendedActions(customerId: string): Promise<RecommendedAction[]> {
  const [
    profile,
    currentSla,
    slaHistory,
    changeSuccess,
    openIncidents,
    certificates,
    patchCompliance,
    costs,
    backups,
    security,
  ] = await Promise.all([
    getVerticalProfile(customerId),
    getCurrentSla(customerId),
    getSlaHistory(customerId),
    getChangeSuccessRate(customerId),
    getOpenIncidents(customerId),
    getCertificates(customerId),
    getPatchCompliance(customerId),
    getCosts(customerId),
    getBackups(customerId),
    getSecurityPosture(customerId),
  ]);

  return evaluateActionRules({
    profile,
    currentSla,
    slaTarget: slaHistory[0]?.target ?? 99.9,
    changeSuccessRate: changeSuccess.rate,
    openIncidents,
    certificates,
    patchCompliance,
    costs,
    backups,
    security,
  });
}
