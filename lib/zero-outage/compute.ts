import { PillarMetric, ZeroOutagePillar, ZeroOutageScore } from "@/types";

export interface ZeroOutageSignals {
  // People
  engagementAvg: number | null; // 0-100
  opportunityReadinessAvg: number | null; // 0-100
  // Processes
  changeSuccessRate: number | null; // %
  mttrP1AvgMinutes: number | null;
  patchCompliancePct: number | null; // %
  // Platforms
  currentSla: number | null; // %
  slaTarget: number;
  securityScore: number | null; // 0-100
  backupSuccessAvg: number | null; // %
}

// Matches the convention in the existing zero-outage mock data: pillar and
// overall scores are graded against a 95-point target.
const OVERALL_TARGET = 95;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

// MTTR has no natural 0-100 scale: 60 min or less on P1 is full marks,
// 480 min (a working day) or more is zero.
export function mttrToScore(mttrMinutes: number): number {
  return clamp(((480 - mttrMinutes) / (480 - 60)) * 100);
}

// SLA attainment is graded on error-budget burn: meeting target is full
// marks, and each multiple of the allowed error budget consumed beyond the
// target costs 25 points, so tight five-nines targets degrade gradually
// instead of collapsing to zero on the first miss.
export function slaAttainmentScore(currentSla: number, slaTarget: number): number {
  if (currentSla >= slaTarget) return 100;
  const errorBudget = 100 - slaTarget;
  if (errorBudget <= 0) return 0;
  const burnMultiple = (slaTarget - currentSla) / errorBudget;
  return clamp(100 - burnMultiple * 25);
}

function pillar(
  name: ZeroOutagePillar["name"],
  candidates: { name: string; value: number | null; target: number; unit: string }[]
): ZeroOutagePillar | null {
  const metrics: PillarMetric[] = candidates
    .filter((m): m is { name: string; value: number; target: number; unit: string } => m.value !== null)
    .map((m) => ({ ...m, value: round1(m.value) }));
  if (metrics.length === 0) return null;

  // Pillar score is the mean target attainment across its metrics, capped at
  // 100 so over-performance on one metric cannot mask a gap on another.
  const score = round1(
    metrics.reduce((sum, m) => sum + clamp((m.value / m.target) * 100), 0) / metrics.length
  );
  return { name, score: Math.min(score, 100), target: OVERALL_TARGET, metrics };
}

export function computeZeroOutageScore(signals: ZeroOutageSignals): ZeroOutageScore | null {
  const pillars = [
    // Targets are stretch goals so the score stays informative on a healthy
    // estate instead of saturating at 100.
    pillar("People", [
      { name: "Engagement", value: signals.engagementAvg, target: 90, unit: "pts" },
      { name: "Opportunity readiness", value: signals.opportunityReadinessAvg, target: 85, unit: "pts" },
    ]),
    pillar("Processes", [
      { name: "Change success rate", value: signals.changeSuccessRate, target: 98, unit: "%" },
      {
        name: "P1 response (MTTR)",
        value: signals.mttrP1AvgMinutes !== null ? mttrToScore(signals.mttrP1AvgMinutes) : null,
        target: 95,
        unit: "pts",
      },
      { name: "Patch compliance", value: signals.patchCompliancePct, target: 98, unit: "%" },
    ]),
    pillar("Platforms", [
      {
        name: "SLA attainment",
        value:
          signals.currentSla !== null
            ? slaAttainmentScore(signals.currentSla, signals.slaTarget)
            : null,
        target: 100,
        unit: "pts",
      },
      { name: "Security score", value: signals.securityScore, target: 95, unit: "pts" },
      { name: "Backup success", value: signals.backupSuccessAvg, target: 99.9, unit: "%" },
    ]),
  ].filter((p): p is ZeroOutagePillar => p !== null);

  if (pillars.length < 3) return null;

  const overall = round1(pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length);
  return { overall, target: OVERALL_TARGET, pillars };
}
