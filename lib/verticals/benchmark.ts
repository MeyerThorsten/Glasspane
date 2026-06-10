import {
  BenchmarkMetricResult,
  BenchmarkStatus,
  VerticalBenchmarkResult,
  VerticalBenchmarkSnapshot,
  VerticalProfile,
} from "@/types";

// "ahead" needs clear margin above target so noisy mock data doesn't flap;
// tolerance scales with the metric's magnitude (SLA targets are ~99.9, scores ~90).
function classify(value: number, target: number, tolerance: number): BenchmarkStatus {
  if (value >= target + tolerance) return "ahead";
  if (value >= target - tolerance) return "on-par";
  return "behind";
}

export function computeVerticalBenchmark(
  profile: VerticalProfile,
  snapshot: VerticalBenchmarkSnapshot
): VerticalBenchmarkResult {
  const b = profile.benchmarks;
  const metrics: BenchmarkMetricResult[] = [
    {
      id: "sla",
      label: "Service availability",
      value: snapshot.currentSla,
      target: b.slaTarget,
      unit: "%",
      status: classify(snapshot.currentSla, b.slaTarget, 0.02),
    },
    {
      id: "security",
      label: "Security score",
      value: snapshot.securityScore,
      target: b.securityScoreTarget,
      unit: "pts",
      status: classify(snapshot.securityScore, b.securityScoreTarget, 1),
    },
    {
      id: "change-success",
      label: "Change success rate",
      value: snapshot.changeSuccessRate,
      target: b.changeSuccessTarget,
      unit: "%",
      status: classify(snapshot.changeSuccessRate, b.changeSuccessTarget, 0.5),
    },
    {
      id: "patch-compliance",
      label: "Patch compliance",
      value: snapshot.patchCompliancePct,
      target: b.patchComplianceTarget,
      unit: "%",
      status: classify(snapshot.patchCompliancePct, b.patchComplianceTarget, 1),
    },
    {
      id: "budget-variance",
      label: "Budget variance",
      value: snapshot.budgetVariancePct,
      target: b.budgetVarianceTolerancePct,
      unit: "%",
      // Lower is better: within tolerance is on-par, well below is ahead.
      status:
        snapshot.budgetVariancePct <= b.budgetVarianceTolerancePct / 2
          ? "ahead"
          : snapshot.budgetVariancePct <= b.budgetVarianceTolerancePct
            ? "on-par"
            : "behind",
    },
  ];

  return {
    profile,
    metrics,
    aheadCount: metrics.filter((m) => m.status === "ahead").length,
    behindCount: metrics.filter((m) => m.status === "behind").length,
  };
}
