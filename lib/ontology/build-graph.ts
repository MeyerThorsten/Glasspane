import {
  CertificateInfo,
  ChangeRecord,
  CostBreakdown,
  Customer,
  Incident,
  OntologyEdge,
  OntologyGraph,
  OntologyNode,
  SecurityPosture,
  Service,
} from "@/types";

export interface OntologyInput {
  customer: Customer;
  services: Service[];
  incidents: Incident[];
  pendingChanges: ChangeRecord[];
  costs: CostBreakdown[];
  certificates: CertificateInfo[];
  security: SecurityPosture;
}

export function customerNodeId(customerId: string): string {
  return `customer:${customerId}`;
}

export function buildOntologyGraph(input: OntologyInput): OntologyGraph {
  const nodes: OntologyNode[] = [];
  const edges: OntologyEdge[] = [];
  const customerId = customerNodeId(input.customer.id);

  nodes.push({
    id: customerId,
    kind: "customer",
    label: input.customer.name,
    meta: { industry: input.customer.industry, tier: input.customer.tier },
  });

  const serviceIdsByName = new Map<string, string>();
  for (const service of input.services) {
    const id = `service:${service.id}`;
    serviceIdsByName.set(service.name.toLowerCase(), id);
    nodes.push({
      id,
      kind: "service",
      label: service.name,
      status: service.status,
      meta: { category: service.category, uptime: service.uptime, slaTarget: service.slaTarget },
    });
    edges.push({ from: customerId, to: id, kind: "subscribes" });
  }

  const serviceIds = new Set(input.services.map((s) => `service:${s.id}`));

  for (const incident of input.incidents) {
    const id = `incident:${incident.id}`;
    nodes.push({
      id,
      kind: "incident",
      label: incident.title,
      status: incident.status,
      meta: {
        severity: incident.severity,
        service: incident.serviceName,
        createdAt: incident.createdAt,
        ...(incident.mttrMinutes !== null ? { mttrMinutes: incident.mttrMinutes } : {}),
      },
    });
    const target = serviceIds.has(`service:${incident.serviceId}`)
      ? `service:${incident.serviceId}`
      : (serviceIdsByName.get(incident.serviceName.toLowerCase()) ?? customerId);
    edges.push({ from: id, to: target, kind: "affects" });
  }

  for (const change of input.pendingChanges) {
    const id = `change:${change.id}`;
    nodes.push({
      id,
      kind: "change",
      label: change.title,
      status: change.status,
      meta: { risk: change.risk, scheduledDate: change.scheduledDate, service: change.serviceName },
    });
    const target = serviceIdsByName.get(change.serviceName.toLowerCase()) ?? customerId;
    edges.push({ from: id, to: target, kind: "targets" });
  }

  input.costs.forEach((cost, idx) => {
    const id = `costCategory:${idx}-${cost.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    nodes.push({
      id,
      kind: "costCategory",
      label: cost.category,
      meta: { currentMonth: cost.currentMonth, budget: cost.budget },
    });
    edges.push({ from: customerId, to: id, kind: "spend-on" });
  });

  for (const cert of input.certificates) {
    const id = `certificate:${cert.domain}`;
    nodes.push({
      id,
      kind: "certificate",
      label: cert.domain,
      status: cert.status,
      meta: { issuer: cert.issuer, expiresAt: cert.expiresAt, daysUntilExpiry: cert.daysUntilExpiry },
    });
    edges.push({ from: id, to: customerId, kind: "secures" });
  }

  for (const cve of input.security.topCves) {
    const id = `cve:${cve.id}`;
    nodes.push({
      id,
      kind: "cve",
      label: cve.id,
      status: cve.severity,
      meta: { affected: cve.affected, description: cve.description },
    });
    const target = serviceIdsByName.get(cve.affected.toLowerCase()) ?? customerId;
    edges.push({ from: id, to: target, kind: "threatens" });
  }

  return { customerId: input.customer.id, nodes, edges };
}
