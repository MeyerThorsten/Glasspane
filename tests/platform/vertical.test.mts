import test from "node:test";
import assert from "node:assert/strict";
import { resolveVerticalProfile, verticalProfiles } from "../../config/vertical-registry.ts";
import { computeVerticalBenchmark } from "../../lib/verticals/benchmark.ts";
import type { VerticalBenchmarkSnapshot } from "../../types/vertical.ts";

test("resolveVerticalProfile matches industries exactly", () => {
  assert.equal(resolveVerticalProfile("Manufacturing").id, "manufacturing");
  assert.equal(resolveVerticalProfile("Technology").id, "technology");
  assert.equal(resolveVerticalProfile("Banking").id, "financial-services");
  assert.equal(resolveVerticalProfile("hospital").id, "healthcare");
});

test("resolveVerticalProfile matches partial industry names", () => {
  assert.equal(resolveVerticalProfile("Automotive Manufacturing").id, "manufacturing");
  assert.equal(resolveVerticalProfile("Retail Banking").id, "financial-services");
  assert.equal(resolveVerticalProfile("Fashion Retail").id, "retail");
});

test("resolveVerticalProfile falls back to the General profile", () => {
  assert.equal(resolveVerticalProfile("Agriculture").id, "general");
  assert.equal(resolveVerticalProfile("").id, "general");
  assert.equal(resolveVerticalProfile("   ").id, "general");
});

test("every vertical profile has complete benchmarks and at least one framework", () => {
  for (const profile of verticalProfiles) {
    assert.ok(profile.benchmarks.slaTarget >= 99, `${profile.id} slaTarget`);
    assert.ok(profile.benchmarks.securityScoreTarget > 0, `${profile.id} securityScoreTarget`);
    assert.ok(profile.benchmarks.changeSuccessTarget > 0, `${profile.id} changeSuccessTarget`);
    assert.ok(profile.benchmarks.patchComplianceTarget > 0, `${profile.id} patchComplianceTarget`);
    assert.ok(profile.complianceFrameworks.length >= 1, `${profile.id} frameworks`);
    assert.ok(profile.priorityCategories.length >= 1, `${profile.id} priorityCategories`);
  }
});

const profile = resolveVerticalProfile("Manufacturing");
// Manufacturing benchmarks: sla 99.95, security 85, changeSuccess 96, patch 92, budget tolerance 5

test("computeVerticalBenchmark classifies ahead, on-par, and behind", () => {
  const snapshot: VerticalBenchmarkSnapshot = {
    currentSla: 99.99, // ahead (>= 99.95 + 0.02)
    securityScore: 85, // on-par (within ±1)
    changeSuccessRate: 90, // behind (< 96 - 0.5)
    patchCompliancePct: 95, // ahead (>= 92 + 1)
    budgetVariancePct: 2, // ahead (<= 5/2)
  };
  const result = computeVerticalBenchmark(profile, snapshot);
  const byId = Object.fromEntries(result.metrics.map((m) => [m.id, m.status]));

  assert.equal(byId["sla"], "ahead");
  assert.equal(byId["security"], "on-par");
  assert.equal(byId["change-success"], "behind");
  assert.equal(byId["patch-compliance"], "ahead");
  assert.equal(byId["budget-variance"], "ahead");
  assert.equal(result.aheadCount, 3);
  assert.equal(result.behindCount, 1);
});

test("computeVerticalBenchmark treats budget variance as lower-is-better", () => {
  const base: VerticalBenchmarkSnapshot = {
    currentSla: 99.95,
    securityScore: 85,
    changeSuccessRate: 96,
    patchCompliancePct: 92,
    budgetVariancePct: 0,
  };
  const within = computeVerticalBenchmark(profile, { ...base, budgetVariancePct: 4 });
  const over = computeVerticalBenchmark(profile, { ...base, budgetVariancePct: 9 });

  assert.equal(within.metrics.find((m) => m.id === "budget-variance")?.status, "on-par");
  assert.equal(over.metrics.find((m) => m.id === "budget-variance")?.status, "behind");
});

test("computeVerticalBenchmark always returns all five metrics", () => {
  const result = computeVerticalBenchmark(profile, {
    currentSla: 0,
    securityScore: 0,
    changeSuccessRate: 0,
    patchCompliancePct: 0,
    budgetVariancePct: 0,
  });
  assert.deepEqual(
    result.metrics.map((m) => m.id),
    ["sla", "security", "change-success", "patch-compliance", "budget-variance"]
  );
});
