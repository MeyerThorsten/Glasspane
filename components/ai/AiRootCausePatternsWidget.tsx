"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import type { AiRootCausePatternsResponse } from "@/types";

const patternColors = ["bg-red-500", "bg-amber-500", "bg-blue-500", "bg-fuchsia-500"];

export default function AiRootCausePatternsWidget() {
  const { customer } = useCustomer();
  const [data, setData] = useState<AiRootCausePatternsResponse | null>(null);
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

    fetch("/api/ai/root-cause-patterns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to generate root cause patterns");
        }
        return response.json() as Promise<AiRootCausePatternsResponse>;
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

        setError(fetchError instanceof Error ? fetchError.message : "Failed to generate root cause patterns");
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

  const patterns = data?.patterns ?? [];
  const providerLabel = data?.providerLabel ?? "AI";

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-gray-100 dark:bg-[#262633] rounded" />
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
          AI Pattern Analysis
        </span>
      </div>
      {patterns.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No dominant root-cause patterns identified.
        </p>
      ) : (
        patterns.map((pattern, index) => (
          <div key={pattern.id} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${patternColors[index % patternColors.length]}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {pattern.category}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {pattern.percentage}%
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 pl-4">
              {pattern.description}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 pl-4">
              → {pattern.recommendation}
            </p>
          </div>
        ))
      )}
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Powered by {providerLabel}
      </p>
    </div>
  );
}
