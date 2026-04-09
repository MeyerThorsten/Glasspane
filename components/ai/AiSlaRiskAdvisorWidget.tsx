"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import type { AiSlaRiskAdvisorResponse, SlaRiskLevel, SlaRiskTrend } from "@/types";

const riskColors: Record<SlaRiskLevel, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

const trendIcons: Record<SlaRiskTrend, string> = {
  declining: "ri-arrow-down-line text-red-500",
  stable: "ri-arrow-right-line text-gray-400",
  improving: "ri-arrow-up-line text-green-500",
};

export default function AiSlaRiskAdvisorWidget() {
  const { customer } = useCustomer();
  const [data, setData] = useState<AiSlaRiskAdvisorResponse | null>(null);
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

    fetch("/api/ai/sla-risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to generate SLA risk advisor");
        }
        return response.json() as Promise<AiSlaRiskAdvisorResponse>;
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
            ? "Timed out while generating the SLA risk advisor"
            : fetchError instanceof Error
              ? fetchError.message
              : "Failed to generate SLA risk advisor",
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

  const services = data?.services ?? [];
  const providerLabel = data?.providerLabel ?? "AI";

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-10 bg-gray-100 dark:bg-[#262633] rounded-lg" />
        <div className="h-10 bg-gray-100 dark:bg-[#262633] rounded-lg" />
        <div className="h-10 bg-gray-100 dark:bg-[#262633] rounded-lg" />
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
          30-Day SLA Risk Forecast
        </span>
      </div>
      {services.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No SLA risks flagged for the current service set.
        </p>
      ) : (
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.serviceName}
              className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-[#2E2E3D] px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {service.serviceName}
                  </p>
                  <i className={`${trendIcons[service.trend]} text-sm flex-shrink-0`} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {service.uptime.toFixed(3)}% current
                </p>
                {service.note ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {service.note}
                  </p>
                ) : null}
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${riskColors[service.risk]}`}
              >
                {service.risk}
              </span>
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
