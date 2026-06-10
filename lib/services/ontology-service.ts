import { Customer, OntologyGraph } from "@/types";
import { getServicesByCategories } from "@/lib/services/service-service";
import { getIncidents } from "@/lib/services/incident-service";
import { getPendingChanges, getCertificates } from "@/lib/services/infrastructure-service";
import { getCosts } from "@/lib/services/kpi-service";
import { getSecurityPosture } from "@/lib/services/security-service";
import { buildOntologyGraph } from "@/lib/ontology/build-graph";

export async function getOntologyGraph(customer: Customer): Promise<OntologyGraph> {
  const [services, incidents, pendingChanges, costs, certificates, security] = await Promise.all([
    getServicesByCategories(customer.subscribedCategories),
    getIncidents(customer.id),
    getPendingChanges(customer.id),
    getCosts(customer.id),
    getCertificates(customer.id),
    getSecurityPosture(customer.id),
  ]);

  return buildOntologyGraph({
    customer,
    services,
    incidents,
    pendingChanges,
    costs,
    certificates,
    security,
  });
}
