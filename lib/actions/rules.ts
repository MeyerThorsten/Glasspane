import {
  ActionSeverity,
  BackupStatus,
  CertificateInfo,
  CostBreakdown,
  Incident,
  PatchCompliance,
  RecommendedAction,
  SecurityPosture,
  VerticalProfile,
} from "@/types";

export interface ActionSnapshot {
  profile: VerticalProfile;
  currentSla: number;
  slaTarget: number;
  changeSuccessRate: number;
  openIncidents: Incident[];
  certificates: CertificateInfo[];
  patchCompliance: PatchCompliance[];
  costs: CostBreakdown[];
  backups: BackupStatus[];
  security: SecurityPosture;
}

const severityRank: Record<ActionSeverity, number> = { critical: 0, warning: 1, info: 2 };

export function evaluateActionRules(snapshot: ActionSnapshot): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  const b = snapshot.profile.benchmarks;

  const expired = snapshot.certificates.filter((c) => c.status === "expired");
  const expiring = snapshot.certificates.filter((c) => c.status === "expiring-soon");
  if (expired.length > 0) {
    actions.push({
      id: "cert-expired",
      title: `Replace ${expired.length} expired certificate${expired.length > 1 ? "s" : ""}`,
      severity: "critical",
      category: "Security",
      rationale: `Expired: ${expired.map((c) => c.domain).join(", ")}. Clients will see trust errors and integrations may already be failing.`,
      suggestedSteps: [
        "Reissue the affected certificates immediately",
        "Verify dependent services reconnect after rotation",
        "Enable automated renewal to prevent recurrence",
      ],
      relatedEntity: `certificate:${expired[0].domain}`,
    });
  }
  if (expiring.length > 0) {
    actions.push({
      id: "cert-expiring",
      title: `Renew ${expiring.length} certificate${expiring.length > 1 ? "s" : ""} expiring soon`,
      severity: "warning",
      category: "Security",
      rationale: `Expiring soon: ${expiring.map((c) => `${c.domain} (${c.daysUntilExpiry}d)`).join(", ")}.`,
      suggestedSteps: [
        "Schedule renewal inside the next change window",
        "Confirm certificate-pinning consumers before rotation",
      ],
      relatedEntity: `certificate:${expiring[0].domain}`,
    });
  }

  const p1Open = snapshot.openIncidents.filter((i) => i.severity === "P1");
  const p2Open = snapshot.openIncidents.filter((i) => i.severity === "P2");
  if (p1Open.length > 0) {
    actions.push({
      id: "incident-p1",
      title: `Drive ${p1Open.length} open P1 incident${p1Open.length > 1 ? "s" : ""} to resolution`,
      severity: "critical",
      category: "Incidents",
      rationale: `Open P1: ${p1Open.map((i) => i.title).join("; ")}. P1 incidents directly threaten the availability commitment.`,
      suggestedSteps: [
        "Confirm a major-incident manager is assigned",
        "Publish stakeholder updates at the agreed cadence",
        "Schedule a post-incident review on resolution",
      ],
      relatedEntity: `incident:${p1Open[0].id}`,
    });
  } else if (p2Open.length >= 2) {
    actions.push({
      id: "incident-p2-cluster",
      title: `Review cluster of ${p2Open.length} open P2 incidents`,
      severity: "warning",
      category: "Incidents",
      rationale: "Multiple concurrent P2 incidents can indicate a shared root cause and risk escalation to P1.",
      suggestedSteps: [
        "Check the open P2s for a common service or change",
        "Prioritize the oldest incident for resolution",
      ],
      relatedEntity: `incident:${p2Open[0].id}`,
    });
  }

  if (snapshot.currentSla < snapshot.slaTarget) {
    actions.push({
      id: "sla-below-target",
      title: "Recover service availability to the SLA target",
      severity: "critical",
      category: "Availability",
      rationale: `Current availability ${snapshot.currentSla.toFixed(3)}% is below the contractual target of ${snapshot.slaTarget}%.`,
      suggestedSteps: [
        "Identify the services consuming the error budget",
        "Freeze high-risk changes until availability recovers",
        "Brief the account team before the customer raises it",
      ],
    });
  }

  const patchTotals = snapshot.patchCompliance.reduce(
    (acc, p) => ({ compliant: acc.compliant + p.compliant, total: acc.total + p.total }),
    { compliant: 0, total: 0 }
  );
  const patchPct = patchTotals.total > 0 ? (patchTotals.compliant / patchTotals.total) * 100 : 100;
  if (patchPct < b.patchComplianceTarget) {
    actions.push({
      id: "patch-below-target",
      title: "Close the patch-compliance gap",
      severity: "warning",
      category: "Security",
      rationale: `Patch compliance ${patchPct.toFixed(1)}% is below the ${snapshot.profile.label} benchmark of ${b.patchComplianceTarget}%.`,
      suggestedSteps: [
        "Prioritize the category with the most non-compliant systems",
        "Schedule maintenance windows for the backlog",
      ],
    });
  }

  const overBudget = snapshot.costs.filter((c) => c.budget > 0 && c.currentMonth > c.budget);
  if (overBudget.length > 0) {
    const worst = [...overBudget].sort(
      (a, c) => c.currentMonth / c.budget - a.currentMonth / a.budget
    )[0];
    actions.push({
      id: "budget-overrun",
      title: `Contain budget overrun in ${worst.category}`,
      severity: "warning",
      category: "Cost",
      rationale: `${overBudget.length} cost categor${overBudget.length > 1 ? "ies are" : "y is"} over budget; worst is ${worst.category} at ${Math.round((worst.currentMonth / worst.budget) * 100)}% of budget.`,
      suggestedSteps: [
        "Review the cost drivers in the overrunning categories",
        "Agree corrective measures or a budget adjustment with the customer",
      ],
    });
  }

  if (snapshot.changeSuccessRate < b.changeSuccessTarget) {
    actions.push({
      id: "change-success-low",
      title: "Stabilize the change process",
      severity: "warning",
      category: "Changes",
      rationale: `Change success rate ${snapshot.changeSuccessRate.toFixed(1)}% is below the ${snapshot.profile.label} benchmark of ${b.changeSuccessTarget}%.`,
      suggestedSteps: [
        "Analyze recent failed changes for common causes",
        "Tighten pre-change testing for high-risk categories",
      ],
    });
  }

  const criticalCves = snapshot.security.topCves.filter((c) => c.severity === "critical");
  if (criticalCves.length > 0) {
    actions.push({
      id: "critical-cves",
      title: `Remediate ${criticalCves.length} critical CVE${criticalCves.length > 1 ? "s" : ""}`,
      severity: "critical",
      category: "Security",
      rationale: `Critical exposure: ${criticalCves.map((c) => `${c.id} (${c.affected})`).join(", ")}.`,
      suggestedSteps: [
        "Apply vendor fixes or mitigations for each critical CVE",
        "Verify exposure of the affected systems from the internet",
      ],
      relatedEntity: `cve:${criticalCves[0].id}`,
    });
  }

  const weakBackups = snapshot.backups.filter((bk) => bk.successRate < 99);
  if (weakBackups.length > 0) {
    actions.push({
      id: "backup-degraded",
      title: `Investigate degraded backups on ${weakBackups.length} service${weakBackups.length > 1 ? "s" : ""}`,
      severity: "warning",
      category: "Resilience",
      rationale: `Backup success below 99%: ${weakBackups.map((bk) => `${bk.serviceName} (${bk.successRate}%)`).join(", ")}.`,
      suggestedSteps: [
        "Review failed backup jobs and fix the underlying cause",
        "Run a restore test for the affected services",
      ],
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "all-clear",
      title: "No corrective actions required",
      severity: "info",
      category: "Operations",
      rationale: "All monitored signals are within their targets and benchmarks.",
      suggestedSteps: ["Continue monitoring; review again after the next reporting cycle"],
    });
  }

  return actions.sort((a, c) => severityRank[a.severity] - severityRank[c.severity]);
}
