"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { BarChart } from "@tremor/react";
import { useCustomer } from "@/lib/customer-context";
import type { AiCapacityPlannerResponse } from "@/types";

function getBarColor(current: number) {
  if (current >= 80) return "text-red-500";
  if (current >= 70) return "text-amber-500";
  return "text-green-500";
}

export default function AiCapacityPlannerWidget() {
  const { customer } = useCustomer();
  const [data, setData] = useState<AiCapacityPlannerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const beginRequest = useEffectEvent(() => {
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
  });

  useEffect(() => {
    if (!customer) return;

    let active = true;
    const controller = new AbortController();
    beginRequest();

    fetch("/api/ai/capacity-planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to generate capacity plan");
        }
        return response.json() as Promise<AiCapacityPlannerResponse>;
      })
      .then((responseData) => {
        if (active) {
          setData(responseData);
        }
      })
      .catch((fetchError) => {
        if (!active || controller.signal.aborted) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to generate capacity plan");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [customer]);

  const resources = data?.resources ?? [];
  const chartData = resources.map((resource) => ({
    resource: resource.type,
    "Current %": resource.current,
    "Headroom %": 100 - resource.current,
  }));
  const providerLabel = data?.providerLabel ?? "AI";

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 bg-gray-100 dark:bg-[#262633] rounded" />
        <div className="h-12 bg-gray-100 dark:bg-[#262633] rounded" />
        <div className="h-12 bg-gray-100 dark:bg-[#262633] rounded" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <i className="ri-sparkling-line text-blue-500" />
        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          AI Capacity Planning
        </span>
      </div>
      <BarChart
        className="h-40"
        data={chartData}
        index="resource"
        categories={["Current %"]}
        colors={["blue"]}
        valueFormatter={(v) => `${v}%`}
        showLegend={false}
        showGridLines={false}
      />
      <div className="space-y-3">
        {resources.map((resource) => (
          <div key={resource.type} className="flex items-start gap-2">
            <div className={`mt-1 ${getBarColor(resource.current)}`}>
              <i className="ri-database-2-line text-sm" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {resource.type}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {resource.current}% used · +{resource.dailyGrowth}%/day
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                80% in {resource.threshold80} · 90% in {resource.threshold90}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                {resource.summary}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Powered by {providerLabel}
      </p>
    </div>
  );
}
