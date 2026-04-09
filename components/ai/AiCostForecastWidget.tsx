"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { AreaChart } from "@tremor/react";
import { useCustomer } from "@/lib/customer-context";
import type { AiCostForecastResponse } from "@/types";

export default function AiCostForecastWidget() {
  const { customer } = useCustomer();
  const [data, setData] = useState<AiCostForecastResponse | null>(null);
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

    fetch("/api/ai/cost-forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to generate cost forecast");
        }
        return response.json() as Promise<AiCostForecastResponse>;
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

        setError(fetchError instanceof Error ? fetchError.message : "Failed to generate cost forecast");
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

  const forecastData = data?.forecast ?? [];
  const providerLabel = data?.providerLabel ?? "AI";

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-4/5" />
        <div className="h-44 bg-gray-100 dark:bg-[#262633] rounded" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <i className="ri-sparkling-line text-blue-500" />
        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          AI Cost Forecast
        </span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {data?.summary || "No cost forecast available."}
      </p>
      <AreaChart
        className="h-44"
        data={forecastData}
        index="month"
        categories={["Pessimistic", "Projected", "Optimistic", "Budget"]}
        colors={["rose", "blue", "emerald", "gray"]}
        valueFormatter={(v) => `€${(v / 1000).toFixed(0)}K`}
        showLegend={true}
        showGridLines={false}
        curveType="monotone"
      />
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Powered by {providerLabel}
      </p>
    </div>
  );
}
