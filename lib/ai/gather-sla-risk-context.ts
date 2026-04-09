import { getCustomerById } from "@/lib/services/customer-service";
import { getIncidents } from "@/lib/services/incident-service";
import { getPendingChanges } from "@/lib/services/infrastructure-service";
import { getServicesByCategories } from "@/lib/services/service-service";

const SEVERITY_ORDER: Record<string, number> = {
  P1: 0,
  P2: 1,
  P3: 2,
  P4: 3,
};

function daysBetween(isoDate: string): number {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

export async function gatherSlaRiskContext(customerId: string): Promise<string> {
  const customer = await getCustomerById(customerId);

  if (!customer) {
    return "";
  }

  const [services, incidents, pendingChanges] = await Promise.all([
    getServicesByCategories(customer.subscribedCategories),
    getIncidents(customerId),
    getPendingChanges(customerId),
  ]);

  const serviceIds = new Set(services.map((service) => service.id));
  const serviceNames = new Set(services.map((service) => service.name));
  const relevantIncidents = incidents.filter(
    (incident) => serviceIds.has(incident.serviceId) || serviceNames.has(incident.serviceName),
  );
  const relevantChanges = pendingChanges.filter((change) => serviceNames.has(change.serviceName));

  const lines = services.map((service) => {
    const serviceIncidents = relevantIncidents.filter(
      (incident) => incident.serviceId === service.id || incident.serviceName === service.name,
    );
    const openIncidents = serviceIncidents.filter(
      (incident) => incident.status === "open" || incident.status === "investigating",
    );
    const recentIncidents = serviceIncidents.filter((incident) => daysBetween(incident.createdAt) <= 30);
    const highestRecentSeverity = recentIncidents
      .map((incident) => incident.severity)
      .sort((left, right) => SEVERITY_ORDER[left] - SEVERITY_ORDER[right])[0] ?? "none";
    const changes = relevantChanges.filter((change) => change.serviceName === service.name);
    const highRiskChanges = changes.filter((change) => change.risk === "high").length;
    const mediumRiskChanges = changes.filter((change) => change.risk === "medium").length;
    const uptimeBuffer = service.uptime - service.slaTarget;

    return [
      `Service: ${service.name}`,
      `Category: ${service.category}`,
      `Status: ${service.status}`,
      `Current uptime: ${service.uptime.toFixed(3)}%`,
      `SLA target: ${service.slaTarget.toFixed(3)}%`,
      `SLA buffer: ${uptimeBuffer.toFixed(3)}%`,
      `Open incidents: ${openIncidents.length}`,
      `Incidents in last 30 days: ${recentIncidents.length}`,
      `Highest recent severity: ${highestRecentSeverity}`,
      `Pending changes: ${changes.length} (high risk: ${highRiskChanges}, medium risk: ${mediumRiskChanges})`,
    ].join(" | ");
  });

  return [
    `Customer: ${customer.name}`,
    `Assess 30-day SLA risk for these subscribed services only.`,
    ...lines,
  ].join("\n");
}
