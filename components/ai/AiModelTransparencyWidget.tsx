"use client";

import { startTransition, useEffect, useEffectEvent, useMemo, useState } from "react";
import { BarChart } from "@tremor/react";
import type { AiModelTransparencySnapshot } from "@/types";

const WINDOWS = [
  { label: "1h", value: "1h" },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
];

function formatTask(task: string) {
  return task
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPct(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function AiModelTransparencyWidget() {
  const [windowValue, setWindowValue] = useState("24h");
  const [snapshot, setSnapshot] = useState<AiModelTransparencySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const beginFetch = useEffectEvent(() => {
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
  });

  useEffect(() => {
    const controller = new AbortController();
    beginFetch();

    fetch(`/api/ai/model-transparency?window=${windowValue}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load AI model telemetry");
        }
        return response.json() as Promise<AiModelTransparencySnapshot>;
      })
      .then(setSnapshot)
      .catch((fetchError) => {
        if (controller.signal.aborted) {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load AI model telemetry");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [windowValue]);

  const observedModels = useMemo(() => {
    const models = snapshot?.models ?? [];
    const withTraffic = models.filter((model) => model.attempts > 0);
    return (withTraffic.length > 0 ? withTraffic : models).slice(0, 8);
  }, [snapshot]);

  const chartData = observedModels
    .filter((model) => model.averageLatencyMs !== null)
    .map((model) => ({
      model: `${formatTask(model.task)} · ${model.providerLabel}`,
      "Avg latency": model.averageLatencyMs ?? 0,
    }));

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 dark:bg-[#262633] rounded" />
        <div className="h-40 bg-gray-100 dark:bg-[#262633] rounded" />
        <div className="h-16 bg-gray-100 dark:bg-[#262633] rounded" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Model Health</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Provider, model, version, latency, errors, and fallback events.
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 dark:border-[#2E2E3D] p-0.5">
          {WINDOWS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setWindowValue(option.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                windowValue === option.value
                  ? "bg-magenta text-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#262633]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {snapshot?.alerts.length ? (
        <div className="space-y-2">
          {snapshot.alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border px-3 py-2 ${
                alert.severity === "critical"
                  ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
                  : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
              }`}
            >
              <div className="flex items-start gap-2">
                <i className={alert.severity === "critical" ? "ri-alarm-warning-line" : "ri-error-warning-line"} />
                <div>
                  <p className="text-xs font-semibold">{alert.title}</p>
                  <p className="text-xs opacity-85">{alert.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
          No version drift or quality degradation detected for the selected window.
        </div>
      )}

      {chartData.length > 0 ? (
        <BarChart
          className="h-44"
          data={chartData}
          index="model"
          categories={["Avg latency"]}
          colors={["blue"]}
          valueFormatter={(value) => `${value} ms`}
          showLegend={false}
          showGridLines={false}
          yAxisWidth={56}
        />
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 dark:border-[#2E2E3D] dark:text-gray-500">
              <th className="py-2 pr-3 font-medium">Task</th>
              <th className="py-2 pr-3 font-medium">Provider</th>
              <th className="py-2 pr-3 font-medium">Model</th>
              <th className="py-2 pr-3 font-medium">Version</th>
              <th className="py-2 pr-3 font-medium">Latency</th>
              <th className="py-2 pr-3 font-medium">Errors</th>
              <th className="py-2 pr-3 font-medium">Fallbacks</th>
            </tr>
          </thead>
          <tbody>
            {observedModels.map((model) => (
              <tr key={model.id} className="border-b border-gray-50 dark:border-[#252533]">
                <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{formatTask(model.task)}</td>
                <td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{model.providerLabel}</td>
                <td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{model.model}</td>
                <td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{model.version}</td>
                <td className="py-2 pr-3 text-gray-600 dark:text-gray-400">
                  {model.averageLatencyMs === null ? "No traffic" : `${model.averageLatencyMs} ms`}
                </td>
                <td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{formatPct(model.errorRate)}</td>
                <td className="py-2 pr-3 text-gray-600 dark:text-gray-400">{model.fallbackEvents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {snapshot?.latestEvents.length ? (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Latest AI insights</p>
          {snapshot.latestEvents.slice(0, 4).map((event) => (
            <div key={event.id} className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className={event.status === "success" ? "text-emerald-600" : "text-red-500"}>
                {event.status}
              </span>
              <span>{formatTask(event.task)}</span>
              <span>{event.providerLabel}</span>
              <span>{event.model}</span>
              <span>v{event.version}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
