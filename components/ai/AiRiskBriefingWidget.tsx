"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import StatusBadge from "@/components/widgets/shared/StatusBadge";
import { useCustomer } from "@/lib/customer-context";
import type { AiRiskBriefingResponse, RiskBriefingSeverity } from "@/types";

const severityColors: Record<RiskBriefingSeverity, "danger" | "warning" | "info"> = {
  critical: "danger",
  warning: "warning",
  info: "info",
};

const severityIcons: Record<RiskBriefingSeverity, string> = {
  critical: "ri-alarm-warning-line text-red-500",
  warning: "ri-error-warning-line text-amber-500",
  info: "ri-information-line text-blue-500",
};

export default function AiRiskBriefingWidget() {
  const { customer } = useCustomer();
  const [data, setData] = useState<AiRiskBriefingResponse | null>(null);
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
    let timedOut = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 5000);

    beginRequest();

    fetch("/api/ai/risk-briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to generate risk briefing");
        }
        return response.json() as Promise<AiRiskBriefingResponse>;
      })
      .then((responseData) => {
        if (active) {
          setData(responseData);
        }
      })
      .catch((fetchError) => {
        if (!active || controller.signal.aborted && !timedOut) {
          return;
        }

        setError(
          timedOut
            ? "Timed out while generating the risk briefing"
            : fetchError instanceof Error
              ? fetchError.message
              : "Failed to generate risk briefing",
        );
      })
      .finally(() => {
        clearTimeout(timeout);
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [customer]);

  const items = data?.items ?? [];
  const providerLabel = data?.providerLabel ?? "AI";

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-4/5" />
        <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-5/6" />
        <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-3/4" />
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
          AI Risk Assessment
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No priority risks flagged at the moment.
        </p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <i className={`${severityIcons[item.severity]} text-lg mt-0.5`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <StatusBadge
                  label={item.severity}
                  variant={severityColors[item.severity]}
                />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {item.text}
              </p>
            </div>
          </div>
        ))
      )}
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Powered by {providerLabel}
      </p>
    </div>
  );
}
