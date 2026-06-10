import test from "node:test";
import assert from "node:assert/strict";
import { buildOntologyGraph, customerNodeId } from "../../lib/ontology/build-graph.ts";
import type { OntologyInput } from "../../lib/ontology/build-graph.ts";
import { getNeighbors, blastRadius, findEntities, graphSummary, getNode } from "../../lib/ontology/queries.ts";

function fixtureInput(): OntologyInput {
  return {
    customer: {
      id: "cust-001",
      name: "Muster AG",
      industry: "Manufacturing",
      tier: "Enterprise Premium",
      subscribedCategories: ["Cloud", "SAP"],
      contactEmail: "it@muster.example",
      logoInitials: "MA",
    },
    services: [
      {
        id: "svc-cloud",
        name: "Cloud Platform",
        category: "Cloud",
        status: "operational",
        uptime: 99.99,
        slaTarget: 99.95,
        description: "Managed cloud",
      },
      {
        id: "svc-sap",
        name: "SAP S/4HANA Managed",
        category: "SAP",
        status: "degraded",
        uptime: 99.7,
        slaTarget: 99.9,
        description: "Managed ERP",
      },
    ],
    incidents: [
      {
        id: "inc-1",
        title: "Cloud storage latency",
        severity: "P2",
        status: "open",
        serviceId: "svc-cloud",
        serviceName: "Cloud Platform",
        createdAt: "2026-06-01T10:00:00Z",
        resolvedAt: null,
        mttrMinutes: null,
      },
      {
        id: "inc-2",
        title: "Orphaned incident",
        severity: "P3",
        status: "resolved",
        serviceId: "svc-unknown",
        serviceName: "Decommissioned Service",
        createdAt: "2026-05-20T08:00:00Z",
        resolvedAt: "2026-05-20T11:00:00Z",
        mttrMinutes: 180,
      },
    ],
    pendingChanges: [
      {
        id: "chg-1",
        title: "SAP kernel upgrade",
        scheduledDate: "2026-06-15",
        risk: "high",
        serviceName: "SAP S/4HANA Managed",
        status: "approved",
      },
    ],
    costs: [
      { category: "Cloud Services", currentMonth: 100, previousMonth: 95, budget: 110 },
    ],
    certificates: [
      {
        domain: "portal.muster.example",
        issuer: "Let's Encrypt",
        expiresAt: "2026-07-01",
        daysUntilExpiry: 21,
        status: "expiring-soon",
      },
    ],
    security: {
      overallScore: 88,
      vulnerabilities: [],
      topCves: [
        {
          id: "CVE-2026-0001",
          severity: "critical",
          affected: "Cloud Platform",
          description: "Remote code execution",
        },
      ],
    },
  };
}

test("buildOntologyGraph creates nodes for all entity kinds", () => {
  const graph = buildOntologyGraph(fixtureInput());
  const summary = graphSummary(graph);

  assert.equal(summary.byKind.customer, 1);
  assert.equal(summary.byKind.service, 2);
  assert.equal(summary.byKind.incident, 2);
  assert.equal(summary.byKind.change, 1);
  assert.equal(summary.byKind.costCategory, 1);
  assert.equal(summary.byKind.certificate, 1);
  assert.equal(summary.byKind.cve, 1);
  assert.equal(summary.total, 9);
  assert.equal(summary.edgeCount, 8);
});

test("incidents link to their service; dangling references fall back to the customer", () => {
  const graph = buildOntologyGraph(fixtureInput());
  const edges = Object.fromEntries(
    graph.edges.filter((e) => e.kind === "affects").map((e) => [e.from, e.to])
  );

  assert.equal(edges["incident:inc-1"], "service:svc-cloud");
  assert.equal(edges["incident:inc-2"], customerNodeId("cust-001"));
});

test("changes and CVEs resolve services by name", () => {
  const graph = buildOntologyGraph(fixtureInput());
  const target = graph.edges.find((e) => e.from === "change:chg-1");
  const cveTarget = graph.edges.find((e) => e.from === "cve:CVE-2026-0001");

  assert.equal(target?.to, "service:svc-sap");
  assert.equal(target?.kind, "targets");
  assert.equal(cveTarget?.to, "service:svc-cloud");
  assert.equal(cveTarget?.kind, "threatens");
});

test("getNeighbors returns relations in both directions", () => {
  const graph = buildOntologyGraph(fixtureInput());
  const neighbors = getNeighbors(graph, "service:svc-cloud");
  const ids = neighbors.map((n) => n.node.id).sort();

  assert.deepEqual(ids, ["customer:cust-001", "cve:CVE-2026-0001", "incident:inc-1"]);
  const incoming = neighbors.find((n) => n.node.id === "incident:inc-1");
  assert.equal(incoming?.direction, "in");
  assert.equal(incoming?.relation, "affects");
});

test("blastRadius expands by hop count and excludes the start node", () => {
  const graph = buildOntologyGraph(fixtureInput());
  const oneHop = blastRadius(graph, "service:svc-cloud", 1);
  const twoHops = blastRadius(graph, "service:svc-cloud", 2);

  assert.equal(oneHop.length, 3);
  assert.ok(oneHop.every((e) => e.hops === 1));
  assert.ok(twoHops.length > oneHop.length);
  assert.ok(twoHops.every((e) => e.node.id !== "service:svc-cloud"));
  const sap = twoHops.find((e) => e.node.id === "service:svc-sap");
  assert.equal(sap?.hops, 2);
});

test("findEntities searches label, kind, status, and metadata", () => {
  const graph = buildOntologyGraph(fixtureInput());

  assert.equal(findEntities(graph, "kernel").length, 1);
  assert.ok(findEntities(graph, "incident").length >= 2);
  assert.ok(findEntities(graph, "degraded").some((n) => n.id === "service:svc-sap"));
  assert.ok(findEntities(graph, "let's encrypt").some((n) => n.kind === "certificate"));
  assert.equal(findEntities(graph, "").length, graph.nodes.length);
});

test("getNode finds nodes by id", () => {
  const graph = buildOntologyGraph(fixtureInput());
  assert.equal(getNode(graph, "customer:cust-001")?.label, "Muster AG");
  assert.equal(getNode(graph, "missing"), undefined);
});
