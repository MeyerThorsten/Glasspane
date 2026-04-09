import { getCertificates, getErrorRates, getPatchCompliance, getPendingChanges } from "@/lib/services/infrastructure-service";
import { getIncidents } from "@/lib/services/incident-service";

export async function gatherRootCausePatternsContext(customerId: string): Promise<string> {
  const [incidents, errorRates, pendingChanges, certificates, patchCompliance] = await Promise.all([
    getIncidents(customerId),
    getErrorRates(customerId),
    getPendingChanges(customerId),
    getCertificates(customerId),
    getPatchCompliance(customerId),
  ]);

  const openIncidents = incidents.filter((incident) => incident.status === "open" || incident.status === "investigating");
  const incidentTitles = incidents.slice(0, 8).map((incident) => `${incident.severity} ${incident.title} (${incident.serviceName})`);
  const topErrorServices = Array.from(
    errorRates.reduce((accumulator, item) => {
      const current = accumulator.get(item.serviceName) ?? [];
      current.push(item.rate);
      accumulator.set(item.serviceName, current);
      return accumulator;
    }, new Map<string, number[]>()),
  )
    .map(([serviceName, rates]) => ({
      serviceName,
      avgRate: rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
    }))
    .sort((left, right) => right.avgRate - left.avgRate)
    .slice(0, 4)
    .map((item) => `${item.serviceName}: ${(item.avgRate * 100).toFixed(2)}% avg error rate`);
  const highRiskChanges = pendingChanges
    .filter((change) => change.risk === "high" || change.risk === "medium")
    .map((change) => `${change.risk} ${change.title} (${change.serviceName})`);
  const expiringCertificates = certificates
    .filter((certificate) => certificate.status !== "valid")
    .map((certificate) => `${certificate.domain}: ${certificate.daysUntilExpiry} days`);
  const patchSummary = patchCompliance.map(
    (item) => `${item.category}: ${item.nonCompliant}/${item.total} non-compliant`,
  );

  return [
    `Open incidents: ${openIncidents.length}`,
    `Recent incident samples: ${incidentTitles.join("; ") || "none"}`,
    `Top error services: ${topErrorServices.join("; ") || "none"}`,
    `Higher-risk pending changes: ${highRiskChanges.join("; ") || "none"}`,
    `Expiring certificates: ${expiringCertificates.join("; ") || "none"}`,
    `Patch compliance: ${patchSummary.join("; ") || "none"}`,
  ].join("\n");
}
