import test from "node:test";
import assert from "node:assert/strict";
import {
  computeZeroOutageScore,
  mttrToScore,
  slaAttainmentScore,
} from "../../lib/zero-outage/compute.ts";
import type { ZeroOutageSignals } from "../../lib/zero-outage/compute.ts";

function fullSignals(): ZeroOutageSignals {
  return {
    engagementAvg: 80,
    opportunityReadinessAvg: 76,
    changeSuccessRate: 97,
    mttrP1AvgMinutes: 60,
    patchCompliancePct: 95,
    currentSla: 99.999,
    slaTarget: 99.999,
    securityScore: 88,
    backupSuccessAvg: 99.8,
  };
}

test("computeZeroOutageScore produces three pillars with metric details", () => {
  const score = computeZeroOutageScore(fullSignals());
  assert.ok(score);
  assert.deepEqual(
    score.pillars.map((p) => p.name),
    ["People", "Processes", "Platforms"]
  );
  assert.equal(score.target, 95);
  for (const pillar of score.pillars) {
    assert.ok(pillar.metrics.length >= 2, `${pillar.name} has metrics`);
    assert.ok(pillar.score > 0 && pillar.score <= 100, `${pillar.name} in range`);
  }
});

test("overall score is the mean of pillar scores", () => {
  const score = computeZeroOutageScore(fullSignals());
  assert.ok(score);
  const mean = score.pillars.reduce((sum, p) => sum + p.score, 0) / 3;
  assert.ok(Math.abs(score.overall - mean) < 0.1);
});

test("pillars skip missing signals but still score from the rest", () => {
  const score = computeZeroOutageScore({ ...fullSignals(), mttrP1AvgMinutes: null });
  assert.ok(score);
  const processes = score.pillars.find((p) => p.name === "Processes");
  assert.equal(processes?.metrics.length, 2);
  assert.ok(!processes?.metrics.some((m) => m.name.includes("MTTR")));
});

test("returns null when an entire pillar has no signals", () => {
  const score = computeZeroOutageScore({
    ...fullSignals(),
    engagementAvg: null,
    opportunityReadinessAvg: null,
  });
  assert.equal(score, null);
});

test("mttrToScore maps fast response to 100 and slow response to 0", () => {
  assert.equal(mttrToScore(30), 100);
  assert.equal(mttrToScore(60), 100);
  assert.equal(mttrToScore(480), 0);
  assert.equal(mttrToScore(600), 0);
  const mid = mttrToScore(270);
  assert.ok(mid > 0 && mid < 100);
});

test("slaAttainmentScore is 100 at target and degrades with the error budget", () => {
  assert.equal(slaAttainmentScore(99.999, 99.999), 100);
  assert.equal(slaAttainmentScore(100, 99.9), 100);
  // Half the error budget burned beyond target -> 12.5 points off.
  assert.ok(Math.abs(slaAttainmentScore(99.85, 99.9) - 87.5) < 0.001);
  // Four times the error budget burned -> floor.
  assert.equal(slaAttainmentScore(99.5, 99.9), 0);
});

test("pillar scores never exceed 100 even with above-target inputs", () => {
  const score = computeZeroOutageScore({
    ...fullSignals(),
    changeSuccessRate: 120,
    patchCompliancePct: 150,
  });
  assert.ok(score);
  for (const pillar of score.pillars) {
    assert.ok(pillar.score <= 100);
  }
});
