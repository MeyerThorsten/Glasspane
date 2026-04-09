import { getCosts, getCurrentSla, getRisk, getChangeSuccessRate, getSlaHistory } from "@/lib/services/kpi-service";
import { getIncidentSummary, getOpenIncidents } from "@/lib/services/incident-service";
import { getSecurityPosture } from "@/lib/services/security-service";

export async function gatherRiskBriefingContext(customerId: string): Promise<string> {
  const [sla, slaHistory, risk, changeSuccessRate, costs, incidentSummary, openIncidents, security] =
    await Promise.all([
      getCurrentSla(customerId),
      getSlaHistory(customerId),
      getRisk(customerId),
      getChangeSuccessRate(customerId),
      getCosts(customerId),
      getIncidentSummary(customerId),
      getOpenIncidents(customerId),
      getSecurityPosture(customerId),
    ]);

  const latestSla = slaHistory[slaHistory.length - 1];
  const previousSla = slaHistory[slaHistory.length - 2];
  const slaDelta = latestSla && previousSla
    ? (latestSla.availability - previousSla.availability).toFixed(3)
    : "0.000";

  const totalBudget = costs.reduce((sum, item) => sum + item.budget, 0);
  const totalCurrent = costs.reduce((sum, item) => sum + item.currentMonth, 0);
  const budgetDelta = totalBudget > 0 ? ((totalCurrent - totalBudget) / totalBudget) * 100 : 0;
  const overBudgetItems = costs
    .filter((item) => item.currentMonth > item.budget)
    .map((item) => `${item.category} +${(((item.currentMonth - item.budget) / item.budget) * 100).toFixed(1)}%`);

  const totalOpenIncidents = incidentSummary.reduce((sum, item) => sum + item.open, 0);
  const incidentBreakdown = incidentSummary
    .filter((item) => item.total > 0)
    .map((item) => `${item.severity}: ${item.open} open / ${item.total} total`)
    .join("; ");
  const notableIncidents = openIncidents
    .slice(0, 3)
    .map((incident) => `${incident.severity} ${incident.title} (${incident.serviceName})`)
    .join("; ");

  const vulnerabilityCounts = security.vulnerabilities
    .map((vulnerability) => `${vulnerability.severity}: ${vulnerability.count}`)
    .join(", ");
  const topCves = security.topCves
    .slice(0, 3)
    .map((cve) => `${cve.id} (${cve.severity}, ${cve.affected})`)
    .join("; ");

  return [
    `Current SLA: ${sla.toFixed(3)}%`,
    `Latest monthly SLA: ${latestSla?.availability.toFixed(3) ?? "n/a"}% vs target ${latestSla?.target ?? "n/a"}% (delta vs previous month: ${slaDelta}%)`,
    `Risk score: overall ${risk.overall}, high ${risk.high}, medium ${risk.medium}, low ${risk.low}, trend ${risk.trend}`,
    `Change success rate: ${changeSuccessRate.rate.toFixed(1)}% (trend ${changeSuccessRate.trend})`,
    `Incidents: ${totalOpenIncidents} open (${incidentBreakdown || "none"})`,
    `Notable open incidents: ${notableIncidents || "none"}`,
    `Security posture: ${security.overallScore}/100`,
    `Vulnerabilities: ${vulnerabilityCounts || "none"}`,
    `Top CVEs: ${topCves || "none"}`,
    `Monthly cost: €${totalCurrent.toLocaleString()} vs budget €${totalBudget.toLocaleString()} (${budgetDelta.toFixed(1)}% vs budget)`,
    `Over budget categories: ${overBudgetItems.join(", ") || "none"}`,
  ].join("\n");
}
