import { getAiConfig, getModelForTask, getTaskEnvPrefix } from "./config";
import { getAiProviderLabel } from "./provider-label";
import { getAiSharedStore } from "./shared-store";
import type { AiProvider, AiTask } from "./providers/types";
import type {
  AiModelHealthSummary,
  AiModelInfo,
  AiModelTelemetryEvent,
  AiModelTransparencyAlert,
  AiModelTransparencySnapshot,
} from "@/types";

const TELEMETRY_KEY = "model-telemetry:v1";
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_MAX_EVENTS = 600;
const DEFAULT_QUALITY_THRESHOLD = 90;

function parsePositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function uniqueProviders(providers: AiProvider[]): AiProvider[] {
  return providers.filter((provider, index) => providers.indexOf(provider) === index);
}

function getTelemetryTtlMs(): number {
  return parsePositiveNumber(process.env.AI_MODEL_TELEMETRY_TTL_MS, DEFAULT_TTL_MS);
}

function getMaxEvents(): number {
  return Math.max(50, Math.round(parsePositiveNumber(process.env.AI_MODEL_TELEMETRY_MAX_EVENTS, DEFAULT_MAX_EVENTS)));
}

function getQualityThreshold(): number {
  return Math.min(
    100,
    Math.max(1, parsePositiveNumber(process.env.AI_MODEL_QUALITY_THRESHOLD, DEFAULT_QUALITY_THRESHOLD)),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTelemetryEvent(value: unknown): AiModelTelemetryEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string"
    || typeof value.task !== "string"
    || typeof value.provider !== "string"
    || typeof value.providerLabel !== "string"
    || typeof value.model !== "string"
    || typeof value.version !== "string"
    || typeof value.servedAt !== "string"
    || (value.status !== "success" && value.status !== "error")
  ) {
    return null;
  }

  return {
    id: value.id,
    task: value.task,
    provider: value.provider,
    providerLabel: value.providerLabel,
    model: value.model,
    version: value.version,
    status: value.status,
    servedAt: value.servedAt,
    latencyMs: typeof value.latencyMs === "number" ? value.latencyMs : undefined,
    fallbackCount: typeof value.fallbackCount === "number" ? value.fallbackCount : undefined,
    error: typeof value.error === "string" ? value.error : undefined,
    fallbackTo: typeof value.fallbackTo === "string" ? value.fallbackTo : undefined,
  };
}

async function readTelemetryEvents(): Promise<AiModelTelemetryEvent[]> {
  const raw = await getAiSharedStore().get(TELEMETRY_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeTelemetryEvent)
      .filter((event): event is AiModelTelemetryEvent => !!event);
  } catch {
    return [];
  }
}

export function getModelVersionForTask(provider: AiProvider, task: AiTask, config = getAiConfig()): string {
  const taskPrefix = getTaskEnvPrefix(task);
  const taskVersion =
    process.env[`AI_${taskPrefix}_MODEL_VERSION`]
    || process.env[`AI_${taskPrefix}_VERSION`];

  if (taskVersion) {
    return taskVersion;
  }

  switch (provider) {
    case "anthropic":
      return config.anthropic.version;
    case "watsonx":
      return process.env.WATSONX_API_VERSION || "2025-02-06";
    case "mock":
      return process.env.MOCK_MODEL_VERSION || "local-mock-v1";
    default:
      return getModelForTask(provider, task, config) || "unversioned";
  }
}

export function getAiModelInfo(task: AiTask, provider: AiProvider): AiModelInfo {
  const config = getAiConfig();
  const model = getModelForTask(provider, task, config) || "glasspane-mock";

  return {
    task,
    provider,
    providerLabel: getAiProviderLabel(provider),
    model,
    version: getModelVersionForTask(provider, task, config),
  };
}

export async function recordAiModelEvent(
  event: Omit<AiModelTelemetryEvent, "id" | "servedAt"> & { servedAt?: string },
): Promise<AiModelTelemetryEvent> {
  const now = Date.now();
  const servedAt = event.servedAt || new Date(now).toISOString();
  const nextEvent: AiModelTelemetryEvent = {
    ...event,
    id: crypto.randomUUID(),
    servedAt,
  };
  const ttlMs = getTelemetryTtlMs();
  const cutoff = now - ttlMs;
  const events = (await readTelemetryEvents())
    .filter((item) => Date.parse(item.servedAt || "") >= cutoff)
    .slice(-(getMaxEvents() - 1));

  events.push(nextEvent);
  await getAiSharedStore().set(TELEMETRY_KEY, JSON.stringify(events), ttlMs);
  return nextEvent;
}

export async function getAiModelTelemetry(windowMs: number): Promise<AiModelTelemetryEvent[]> {
  const cutoff = Date.now() - windowMs;
  return (await readTelemetryEvents())
    .filter((event) => Date.parse(event.servedAt || "") >= cutoff)
    .sort((a, b) => Date.parse(b.servedAt || "") - Date.parse(a.servedAt || ""));
}

function createEmptySummary(task: AiTask, provider: AiProvider): AiModelHealthSummary {
  const info = getAiModelInfo(task, provider);
  return {
    id: `${info.task}:${info.provider}:${info.model}:${info.version}`,
    task: info.task,
    provider: info.provider,
    providerLabel: info.providerLabel,
    model: info.model,
    version: info.version,
    attempts: 0,
    successes: 0,
    errors: 0,
    fallbackEvents: 0,
    averageLatencyMs: null,
    latestLatencyMs: null,
    errorRate: 0,
    qualityScore: null,
    lastSeenAt: null,
  };
}

function configuredSummaries(): AiModelHealthSummary[] {
  const config = getAiConfig();

  return Object.entries(config.tasks).flatMap(([task, taskConfig]) =>
    uniqueProviders([taskConfig.primary, ...taskConfig.fallbacks]).map((provider) =>
      createEmptySummary(task as AiTask, provider),
    ),
  );
}

function summarizeEvents(events: AiModelTelemetryEvent[]): AiModelHealthSummary[] {
  const groups = new Map<string, AiModelHealthSummary & { latencyTotal: number; latencyCount: number }>();

  for (const base of configuredSummaries()) {
    groups.set(base.id, {
      ...base,
      latencyTotal: 0,
      latencyCount: 0,
    });
  }

  for (const event of events) {
    const id = `${event.task}:${event.provider}:${event.model}:${event.version}`;
    const existing = groups.get(id) ?? {
      id,
      task: event.task,
      provider: event.provider,
      providerLabel: event.providerLabel,
      model: event.model,
      version: event.version,
      attempts: 0,
      successes: 0,
      errors: 0,
      fallbackEvents: 0,
      averageLatencyMs: null,
      latestLatencyMs: null,
      errorRate: 0,
      qualityScore: null,
      lastSeenAt: null,
      latencyTotal: 0,
      latencyCount: 0,
    };

    existing.attempts += 1;
    if (event.status === "success") {
      existing.successes += 1;
    } else {
      existing.errors += 1;
    }
    if (event.fallbackTo || (event.fallbackCount ?? 0) > 0) {
      existing.fallbackEvents += event.fallbackTo ? 1 : event.fallbackCount ?? 0;
    }
    if (typeof event.latencyMs === "number") {
      existing.latencyTotal += event.latencyMs;
      existing.latencyCount += 1;
      if (!existing.latestLatencyMs || Date.parse(event.servedAt || "") >= Date.parse(existing.lastSeenAt || "")) {
        existing.latestLatencyMs = event.latencyMs;
      }
    }
    if (!existing.lastSeenAt || Date.parse(event.servedAt || "") > Date.parse(existing.lastSeenAt)) {
      existing.lastSeenAt = event.servedAt || null;
    }

    groups.set(id, existing);
  }

  return [...groups.values()]
    .map(({ latencyTotal, latencyCount, ...summary }) => {
      const errorRate = summary.attempts > 0 ? summary.errors / summary.attempts : 0;
      return {
        ...summary,
        averageLatencyMs: latencyCount > 0 ? Math.round(latencyTotal / latencyCount) : null,
        errorRate,
        qualityScore: summary.attempts > 0 ? Math.round((1 - errorRate) * 100) : null,
      };
    })
    .sort((a, b) => {
      if (a.lastSeenAt && b.lastSeenAt) {
        return Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt);
      }
      if (a.lastSeenAt) return -1;
      if (b.lastSeenAt) return 1;
      return a.task.localeCompare(b.task);
    });
}

function buildAlerts(events: AiModelTelemetryEvent[], models: AiModelHealthSummary[]): AiModelTransparencyAlert[] {
  const threshold = getQualityThreshold();
  const detectedAt = new Date().toISOString();
  const alerts: AiModelTransparencyAlert[] = [];
  const versionsByTaskProvider = new Map<string, Set<string>>();

  for (const event of events) {
    const key = `${event.task}:${event.provider}`;
    const versions = versionsByTaskProvider.get(key) ?? new Set<string>();
    versions.add(`${event.model}@${event.version}`);
    versionsByTaskProvider.set(key, versions);
  }

  for (const [key, versions] of versionsByTaskProvider) {
    if (versions.size <= 1) {
      continue;
    }

    const [task, provider] = key.split(":");
    alerts.push({
      id: `version:${key}`,
      severity: "warning",
      title: "Model version changed",
      detail: `${provider} served ${task} with ${versions.size} model/version identities in the selected window.`,
      task,
      provider,
      detectedAt,
    });
  }

  for (const model of models) {
    if (model.qualityScore !== null && model.qualityScore < threshold) {
      alerts.push({
        id: `quality:${model.id}`,
        severity: model.errorRate >= 0.5 ? "critical" : "warning",
        title: "AI quality below threshold",
        detail: `${model.providerLabel} ${model.model} is at ${model.qualityScore}% success for ${model.task}; threshold is ${threshold}%.`,
        task: model.task,
        provider: model.provider,
        detectedAt,
      });
    }

    if (model.fallbackEvents > 0) {
      alerts.push({
        id: `fallback:${model.id}`,
        severity: "warning",
        title: "Provider fallback occurred",
        detail: `${model.fallbackEvents} fallback event${model.fallbackEvents === 1 ? "" : "s"} recorded for ${model.task}.`,
        task: model.task,
        provider: model.provider,
        detectedAt,
      });
    }
  }

  return alerts.slice(0, 8);
}

export async function getAiModelTransparencySnapshot(windowMs: number): Promise<AiModelTransparencySnapshot> {
  const events = await getAiModelTelemetry(windowMs);
  const models = summarizeEvents(events);

  return {
    windowMs,
    generatedAt: new Date().toISOString(),
    models,
    alerts: buildAlerts(events, models),
    latestEvents: events.slice(0, 12),
  };
}
