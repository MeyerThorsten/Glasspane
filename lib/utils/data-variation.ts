/**
 * Deterministic daily value perturbation and synthetic data growth.
 *
 * All randomness is seeded by the current UTC date so that values are
 * stable within a single day but change day-to-day.
 */

import { getDaysDelta } from "./date-shift";

/** Mulberry32 — fast 32-bit PRNG returning values in [0, 1). */
export function mulberry32(seed: number): () => number {
  let t = seed | 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let v = Math.imul(t ^ (t >>> 15), 1 | t);
    v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v;
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}

/** djb2 hash of a string → 32-bit unsigned integer. */
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/** Return a deterministic seed for today + key. Same day + key → same seed. */
export function dayHash(key: string): number {
  const today = new Date();
  const dateStr = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;
  return djb2(`${dateStr}|${key}`);
}

/**
 * Nudge a numeric value by ±pct%, deterministic per key.
 * Result is clamped to [min, max] if provided.
 */
export function perturb(
  value: number,
  pct: number,
  key: string,
  min?: number,
  max?: number,
): number {
  const rng = mulberry32(dayHash(key));
  const factor = 1 + (rng() * 2 - 1) * (pct / 100);
  let result = value * factor;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return Math.round(result * 100) / 100;
}

/** Same as perturb but returns a rounded integer. */
export function perturbInt(
  value: number,
  pct: number,
  key: string,
  min?: number,
  max?: number,
): number {
  return Math.round(perturb(value, pct, key, min, max));
}

/**
 * Nudge an integer by an absolute amount ±abs, deterministic per key.
 * Result is clamped to [min, max] if provided.
 */
export function perturbAbsolute(
  value: number,
  abs: number,
  key: string,
  min?: number,
  max?: number,
): number {
  const rng = mulberry32(dayHash(key));
  const offset = Math.round((rng() * 2 - 1) * abs);
  let result = value + offset;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}

/** Returns a weekday factor: Mon-Fri higher (1.0-1.15), Sat-Sun lower (0.75-0.85) */
export function weekdayFactor(dateStr: string): number {
  const day = new Date(dateStr + "T00:00:00Z").getUTCDay(); // 0=Sun, 6=Sat
  if (day === 0) return 0.78;
  if (day === 6) return 0.82;
  if (day === 1) return 1.12; // Monday ramp-up
  if (day === 5) return 0.95; // Friday wind-down
  return 1.0 + (day - 2) * 0.02; // Tue-Thu slight rise
}

/** Returns true ~8% of days, seeded by date string + seed */
export function shouldSpike(dateStr: string, seed: string): boolean {
  const hash = dayHash(`spike|${dateStr}|${seed}`);
  const rng = mulberry32(hash);
  return rng() < 0.08;
}

/** Returns spike multiplier 1.3-1.8 when spiking, 1.0 otherwise */
export function spikeMultiplier(dateStr: string, seed: string): number {
  if (!shouldSpike(dateStr, seed)) return 1.0;
  const rng = mulberry32(dayHash(`spikeMul|${dateStr}|${seed}`));
  return 1.3 + rng() * 0.5;
}

/** Seasonal cost factor: Q4 higher (year-end), Q1 lower (budget reset) */
export function seasonalCostFactor(date: Date): number {
  const month = date.getMonth(); // 0-indexed
  const factors = [0.92, 0.94, 0.97, 1.0, 1.02, 1.0, 0.98, 1.01, 1.03, 1.05, 1.08, 1.12];
  return factors[month];
}

/** Correlate metric B with metric A: when A spikes, B increases proportionally */
export function correlateMetric(baseValue: number, correlationFactor: number, baseSpike: number): number {
  const spillover = (baseSpike - 1.0) * correlationFactor;
  return baseValue * (1.0 + spillover);
}

/**
 * Append synthetic months to a monthly time-series array.
 * Compares the last item's month against the current month and fills the gap.
 * `monthField` is the key containing the "YYYY-MM" string.
 * `generate` receives (month, rng) and returns a new item to append.
 */
export function extendMonthlyData<T extends object>(
  items: T[],
  monthField: keyof T,
  generate: (month: string, rng: () => number) => T,
): T[] {
  if (items.length === 0) return items;

  const lastMonth = items[items.length - 1][monthField] as string;
  const [lastY, lastM] = lastMonth.split("-").map(Number);

  const now = new Date();
  const curY = now.getUTCFullYear();
  const curM = now.getUTCMonth() + 1;
  const monthsToAdd = (curY - lastY) * 12 + (curM - lastM);

  if (monthsToAdd <= 0) return items;

  const result = [...items];
  for (let i = 1; i <= monthsToAdd; i++) {
    const d = new Date(Date.UTC(lastY, lastM - 1 + i, 1));
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const month = `${y}-${m}`;
    const rng = mulberry32(dayHash(`extend|${month}`));
    result.push(generate(month, rng));
  }

  return result;
}

/**
 * Append synthetic days to a daily time-series array.
 * Compares the last item's date against today and fills the gap.
 * `dateField` is the key containing the "YYYY-MM-DD" string.
 * `generate` receives (date, rng, previousItem) and returns a new item.
 */
export function extendDailyData<T extends object>(
  items: T[],
  dateField: keyof T,
  generate: (date: string, rng: () => number, prev: T) => T,
): T[] {
  if (items.length === 0) return items;

  const lastDate = items[items.length - 1][dateField] as string;
  const lastD = new Date(lastDate + "T00:00:00Z");
  const now = new Date();
  const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysToAdd = Math.floor((todayMs - lastD.getTime()) / 86_400_000);

  if (daysToAdd <= 0) return items;

  const result = [...items];
  for (let i = 1; i <= daysToAdd; i++) {
    const d = new Date(lastD.getTime() + i * 86_400_000);
    const dateStr = d.toISOString().slice(0, 10);
    const rng = mulberry32(dayHash(`extendDaily|${dateStr}`));
    result.push(generate(dateStr, rng, result[result.length - 1]));
  }

  return result;
}

/**
 * Same as perturb but includes an epoch counter in the seed,
 * so refreshing produces different values.
 */
export function perturbWithEpoch(
  value: number,
  pct: number,
  key: string,
  epoch: number,
  min?: number,
  max?: number,
): number {
  const today = new Date();
  const dateStr = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;
  const rng = mulberry32(djb2(`${dateStr}|${key}|${epoch}`));
  const factor = 1 + (rng() * 2 - 1) * (pct / 100);
  let result = value * factor;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return Math.round(result * 100) / 100;
}

/**
 * Generate synthetic incidents that appear over elapsed weeks.
 * Returns 1-2 per elapsed week, capped at `maxNew` total.
 */
export function generateSyntheticIncidents(
  existingCount: number,
  maxNew: number = 20,
): Array<{
  id: string;
  title: string;
  severity: "P1" | "P2" | "P3" | "P4";
  status: "open" | "investigating" | "resolved" | "closed";
  serviceId: string;
  serviceName: string;
  createdAt: string;
  resolvedAt: string | null;
  mttrMinutes: number | null;
}> {
  const daysDelta = getDaysDelta();
  const weeksElapsed = Math.floor(daysDelta / 7);
  if (weeksElapsed === 0) return [];

  const titles = [
    "Elevated API response times",
    "Database connection pool exhaustion",
    "Certificate renewal failure",
    "Memory leak in worker process",
    "DNS resolution timeouts",
    "Load balancer health check failures",
    "Storage IOPS throttling",
    "Authentication service degradation",
    "Cache invalidation storm",
    "Network packet loss on subnet",
    "Scheduled job execution delay",
    "CDN origin connection errors",
    "Message queue backlog buildup",
    "TLS handshake failures",
    "Container OOM kills detected",
    "Backup job timeout",
    "Service discovery propagation delay",
    "Rate limiter misconfiguration",
    "Log pipeline ingestion lag",
    "Unexpected pod restarts",
  ];

  const services = [
    { id: "svc-api", name: "API Gateway" },
    { id: "svc-db", name: "Database Cluster" },
    { id: "svc-auth", name: "Auth Service" },
    { id: "svc-web", name: "Web Frontend" },
    { id: "svc-queue", name: "Message Queue" },
    { id: "svc-cache", name: "Cache Layer" },
  ];

  const severities: Array<"P1" | "P2" | "P3" | "P4"> = ["P1", "P2", "P3", "P4"];
  const statuses: Array<"open" | "investigating" | "resolved" | "closed"> = [
    "resolved",
    "closed",
    "resolved",
    "open",
  ];

  const incidents: Array<{
    id: string;
    title: string;
    severity: "P1" | "P2" | "P3" | "P4";
    status: "open" | "investigating" | "resolved" | "closed";
    serviceId: string;
    serviceName: string;
    createdAt: string;
    resolvedAt: string | null;
    mttrMinutes: number | null;
  }> = [];

  const rng = mulberry32(dayHash("synthetic-incidents"));

  for (let w = 1; w <= weeksElapsed && incidents.length < maxNew; w++) {
    const countThisWeek = rng() < 0.5 ? 1 : 2;
    for (let j = 0; j < countThisWeek && incidents.length < maxNew; j++) {
      const idx = incidents.length;
      const titleIdx = Math.floor(rng() * titles.length);
      const svcIdx = Math.floor(rng() * services.length);
      const sevIdx = Math.floor(rng() * severities.length);
      const statusIdx = Math.floor(rng() * statuses.length);
      const status = statuses[statusIdx];

      // Created sometime during that week
      const daysAgo = daysDelta - (w * 7) + Math.floor(rng() * 7);
      const created = new Date();
      created.setUTCDate(created.getUTCDate() - Math.max(0, daysAgo));
      created.setUTCHours(Math.floor(rng() * 24), Math.floor(rng() * 60), 0, 0);

      const isResolved = status === "resolved" || status === "closed";
      const mttr = isResolved ? Math.floor(30 + rng() * 300) : null;
      const resolvedAt = isResolved
        ? new Date(created.getTime() + (mttr! * 60000)).toISOString()
        : null;

      incidents.push({
        id: `INC-SYN-${String(existingCount + idx + 1).padStart(3, "0")}`,
        title: titles[titleIdx],
        severity: severities[sevIdx],
        status,
        serviceId: services[svcIdx].id,
        serviceName: services[svcIdx].name,
        createdAt: created.toISOString(),
        resolvedAt,
        mttrMinutes: mttr,
      });
    }
  }

  return incidents;
}
