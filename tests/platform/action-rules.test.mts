import test from "node:test";
import assert from "node:assert/strict";
import { evaluateActionRules } from "../../lib/actions/rules.ts";
import type { ActionSnapshot } from "../../lib/actions/rules.ts";
import { resolveVerticalProfile } from "../../config/vertical-registry.ts";
import type { CertificateInfo, Incident } from "../../types/index.ts";

// Manufacturing benchmarks: changeSuccess 96, patch 92.
const profile = resolveVerticalProfile("Manufacturing");

function healthySnapshot(): ActionSnapshot {
  return {
    profile,
    currentSla: 99.999,
    slaTarget: 99.999,
    changeSuccessRate: 97,
    openIncidents: [],
    certificates: [
      {
        domain: "ok.example",
        issuer: "DigiCert",
        expiresAt: "2027-01-01",
        daysUntilExpiry: 200,
        status: "valid",
      },
    ],
    patchCompliance: [{ category: "OS", compliant: 95, nonCompliant: 5, total: 100 }],
    costs: [{ category: "Cloud", currentMonth: 90, previousMonth: 88, budget: 100 }],
    backups: [
      { serviceName: "Cloud", lastBackup: "2026-06-09", successRate: 99.9, nextScheduled: "2026-06-10" },
    ],
    security: { overallScore: 90, vulnerabilities: [], topCves: [] },
  };
}

function incident(severity: Incident["severity"], id = "inc-x"): Incident {
  return {
    id,
    title: `${severity} incident`,
    severity,
    status: "open",
    serviceId: "svc-1",
    serviceName: "Cloud",
    createdAt: "2026-06-09T00:00:00Z",
    resolvedAt: null,
    mttrMinutes: null,
  };
}

test("healthy snapshot yields only the all-clear info action", () => {
  const actions = evaluateActionRules(healthySnapshot());
  assert.equal(actions.length, 1);
  assert.equal(actions[0].id, "all-clear");
  assert.equal(actions[0].severity, "info");
});

test("expired certificate raises a critical action", () => {
  const cert: CertificateInfo = {
    domain: "dead.example",
    issuer: "DigiCert",
    expiresAt: "2026-06-01",
    daysUntilExpiry: -9,
    status: "expired",
  };
  const actions = evaluateActionRules({ ...healthySnapshot(), certificates: [cert] });
  const action = actions.find((a) => a.id === "cert-expired");
  assert.ok(action);
  assert.equal(action.severity, "critical");
  assert.ok(action.rationale.includes("dead.example"));
});

test("expiring-soon certificate raises a warning", () => {
  const cert: CertificateInfo = {
    domain: "soon.example",
    issuer: "DigiCert",
    expiresAt: "2026-06-20",
    daysUntilExpiry: 10,
    status: "expiring-soon",
  };
  const actions = evaluateActionRules({ ...healthySnapshot(), certificates: [cert] });
  assert.equal(actions.find((a) => a.id === "cert-expiring")?.severity, "warning");
});

test("open P1 incident raises a critical action", () => {
  const actions = evaluateActionRules({
    ...healthySnapshot(),
    openIncidents: [incident("P1", "inc-p1")],
  });
  const action = actions.find((a) => a.id === "incident-p1");
  assert.equal(action?.severity, "critical");
  assert.equal(action?.relatedEntity, "incident:inc-p1");
});

test("a cluster of P2 incidents raises a warning, a single P2 does not", () => {
  const one = evaluateActionRules({ ...healthySnapshot(), openIncidents: [incident("P2")] });
  const two = evaluateActionRules({
    ...healthySnapshot(),
    openIncidents: [incident("P2", "a"), incident("P2", "b")],
  });
  assert.equal(one.find((a) => a.id === "incident-p2-cluster"), undefined);
  assert.equal(two.find((a) => a.id === "incident-p2-cluster")?.severity, "warning");
});

test("SLA below target raises a critical action", () => {
  const actions = evaluateActionRules({ ...healthySnapshot(), currentSla: 99.95 });
  assert.equal(actions.find((a) => a.id === "sla-below-target")?.severity, "critical");
});

test("patch compliance below the vertical benchmark raises a warning", () => {
  const actions = evaluateActionRules({
    ...healthySnapshot(),
    patchCompliance: [{ category: "OS", compliant: 80, nonCompliant: 20, total: 100 }],
  });
  const action = actions.find((a) => a.id === "patch-below-target");
  assert.equal(action?.severity, "warning");
  assert.ok(action?.rationale.includes("Manufacturing"));
});

test("budget overrun names the worst category", () => {
  const actions = evaluateActionRules({
    ...healthySnapshot(),
    costs: [
      { category: "Cloud", currentMonth: 105, previousMonth: 100, budget: 100 },
      { category: "Security", currentMonth: 150, previousMonth: 100, budget: 100 },
    ],
  });
  const action = actions.find((a) => a.id === "budget-overrun");
  assert.ok(action?.title.includes("Security"));
});

test("low change success rate raises a warning", () => {
  const actions = evaluateActionRules({ ...healthySnapshot(), changeSuccessRate: 90 });
  assert.equal(actions.find((a) => a.id === "change-success-low")?.severity, "warning");
});

test("critical CVEs raise a critical action", () => {
  const actions = evaluateActionRules({
    ...healthySnapshot(),
    security: {
      overallScore: 70,
      vulnerabilities: [],
      topCves: [
        { id: "CVE-2026-1", severity: "critical", affected: "Cloud", description: "RCE" },
        { id: "CVE-2026-2", severity: "high", affected: "SAP", description: "DoS" },
      ],
    },
  });
  const action = actions.find((a) => a.id === "critical-cves");
  assert.ok(action?.rationale.includes("CVE-2026-1"));
  assert.ok(!action?.rationale.includes("CVE-2026-2"));
});

test("degraded backups raise a warning", () => {
  const actions = evaluateActionRules({
    ...healthySnapshot(),
    backups: [
      { serviceName: "SAP", lastBackup: "2026-06-09", successRate: 97.5, nextScheduled: "2026-06-10" },
    ],
  });
  assert.equal(actions.find((a) => a.id === "backup-degraded")?.severity, "warning");
});

test("actions are sorted critical first", () => {
  const actions = evaluateActionRules({
    ...healthySnapshot(),
    currentSla: 99.9, // critical
    changeSuccessRate: 90, // warning
    backups: [
      { serviceName: "SAP", lastBackup: "2026-06-09", successRate: 97, nextScheduled: "2026-06-10" },
    ], // warning
  });
  const severities = actions.map((a) => a.severity);
  const firstWarning = severities.indexOf("warning");
  const lastCritical = severities.lastIndexOf("critical");
  assert.ok(lastCritical < firstWarning);
});
