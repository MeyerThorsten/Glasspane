"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import type { AiChangeImpactResponse } from "@/types";

function getRiskColor(score: number) {
  if (score >= 4) return "bg-red-500";
  if (score >= 3) return "bg-amber-500";
  if (score >= 2) return "bg-yellow-400";
  return "bg-green-500";
}

function getRiskBg(score: number) {
  if (score >= 4) return "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20";
  if (score >= 3) return "border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20";
  return "border-gray-100 dark:border-[#2E2E3D]";
}

export default function AiChangeImpactWidget() {
  const { customer } = useCustomer();
  const [data, setData] = useState<AiChangeImpactResponse | null>(null);
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

    fetch("/api/ai/change-impact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to generate change impact analysis");
        }
        return response.json() as Promise<AiChangeImpactResponse>;
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

        setError(fetchError instanceof Error ? fetchError.message : "Failed to generate change impact analysis");
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

  const changes = data?.changes ?? [];
  const providerLabel = data?.providerLabel ?? "AI";

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-16 bg-gray-100 dark:bg-[#262633] rounded-lg" />
        <div className="h-16 bg-gray-100 dark:bg-[#262633] rounded-lg" />
        <div className="h-16 bg-gray-100 dark:bg-[#262633] rounded-lg" />
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
          Change Impact Analysis
        </span>
      </div>
      {changes.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No pending changes to analyze.
        </p>
      ) : (
        <div className="space-y-2">
        {changes.map((change) => (
          <div
            key={change.id}
            className={`rounded-lg border px-3 py-2.5 ${getRiskBg(change.riskScore)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${getRiskColor(change.riskScore)}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
                {change.title}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{change.date}</span>
            </div>
            <div className="flex items-center gap-4 pl-4.5 text-xs text-gray-500 dark:text-gray-400">
              <span>Risk: {change.riskScore}/5</span>
              <span>Success rate: {change.successRate}%</span>
            </div>
            {change.note ? (
              <p className="pl-4.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                {change.note}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-1 mt-1.5 pl-4.5">
              {change.affectedServices.map((service) => (
                <span
                  key={service}
                  className="text-[10px] bg-gray-100 dark:bg-[#262633] text-gray-600 dark:text-gray-400 rounded px-1.5 py-0.5"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Powered by {providerLabel}
      </p>
    </div>
  );
}
