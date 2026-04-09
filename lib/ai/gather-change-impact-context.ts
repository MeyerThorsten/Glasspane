import { getIncidents } from "@/lib/services/incident-service";
import { getPendingChanges } from "@/lib/services/infrastructure-service";

function daysBetween(isoDate: string): number {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

export async function gatherChangeImpactContext(customerId: string): Promise<string> {
  const [changes, incidents] = await Promise.all([
    getPendingChanges(customerId),
    getIncidents(customerId),
  ]);

  const lines = changes.map((change) => {
    const relatedIncidents = incidents.filter(
      (incident) => incident.serviceName === change.serviceName && daysBetween(incident.createdAt) <= 30,
    );
    const openRelated = relatedIncidents.filter(
      (incident) => incident.status === "open" || incident.status === "investigating",
    );

    return [
      `Change ID: ${change.id}`,
      `Title: ${change.title}`,
      `Service: ${change.serviceName}`,
      `Risk: ${change.risk}`,
      `Status: ${change.status}`,
      `Scheduled date: ${change.scheduledDate}`,
      `Related incidents in last 30 days: ${relatedIncidents.length}`,
      `Open related incidents: ${openRelated.length}`,
    ].join(" | ");
  });

  return lines.join("\n");
}
