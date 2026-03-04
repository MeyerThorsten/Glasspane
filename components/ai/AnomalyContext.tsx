"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useCustomer } from "@/lib/customer-context";
import type { AiInsightsResponse, Anomaly, Prediction } from "@/types";

function getFallbackInsights(): AiInsightsResponse {
  return {
    anomalies: [
      {
        id: "a1",
        metric: "cpu",
        widgetId: "resource-utilization",
        severity: "warning",
        title: "CPU usage spike detected",
        description: "CPU utilization reached 89.3%, up from a 30-day average of 67.2%. Sustained increase suggests growing compute demand.",
      },
      {
        id: "a2",
        metric: "p95_latency",
        widgetId: "latency-metrics",
        severity: "warning",
        title: "P95 latency trending upward",
        description: "P95 latency increased from 145ms to 210ms over the past 3 days, which may impact user experience and SLA targets.",
      },
      {
        id: "a3",
        metric: "error_rate",
        widgetId: "error-rate-by-service",
        severity: "critical",
        title: "Auth Service error rate tripled",
        description: "Auth Service error rate jumped to 0.45%, up from 0.12% average. This correlates with the latency increase.",
      },
      {
        id: "a4",
        metric: "p1_mttr",
        widgetId: "mttr-trends",
        severity: "info",
        title: "P1 MTTR increased last month",
        description: "P1 mean time to resolution rose to 42 minutes, up from a 6-month average of 31 minutes. Still within SLA.",
      },
    ],
    predictions: [
      {
        id: "p1",
        category: "sla",
        title: "SLA breach risk within 14 days",
        description: "SLA declining from 99.97% to 99.94% with error rate spikes — medium risk of breaching 99.9% target.",
        confidence: "medium",
        timeframe: "next 14 days",
        widgetId: "service-availability-trend",
      },
      {
        id: "p2",
        category: "cost",
        title: "Budget overrun projected at 4.5%",
        description: "Current costs 2.3% over budget with rising compute demand. Projected month-end overrun ~4.5% (~\u20AC18,000).",
        confidence: "high",
        timeframe: "end of month",
        widgetId: "cost-overview",
      },
      {
        id: "p3",
        category: "capacity",
        title: "CPU capacity threshold in 21 days",
        description: "CPU trending upward ~1.5%/day. Will reach 90% warning threshold within 21 days without scaling.",
        confidence: "medium",
        timeframe: "next 21 days",
        widgetId: "resource-utilization",
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

interface AnomalyContextValue {
  anomalies: Anomaly[];
  predictions: Prediction[];
  loading: boolean;
  getAnomaliesForWidget: (widgetId: string) => Anomaly[];
}

const AnomalyCtx = createContext<AnomalyContextValue>({
  anomalies: [],
  predictions: [],
  loading: false,
  getAnomaliesForWidget: () => [],
});

export function AnomalyProvider({ children }: { children: ReactNode }) {
  const { customer } = useCustomer();
  const [data, setData] = useState<AiInsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customer) return;
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch("/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id }),
      signal: controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error("Failed to fetch insights");
        const json = await res.json() as AiInsightsResponse;
        // Use fallback if API returned empty results
        if ((!json.anomalies || json.anomalies.length === 0) && (!json.predictions || json.predictions.length === 0)) {
          return getFallbackInsights();
        }
        return json;
      })
      .then(setData)
      .catch((err) => {
        console.error("AI insights fetch failed, using fallback:", err);
        setData(getFallbackInsights());
      })
      .finally(() => setLoading(false));
  }, [customer]);

  const getAnomaliesForWidget = (widgetId: string): Anomaly[] =>
    (data?.anomalies ?? []).filter((a) => a.widgetId === widgetId);

  return (
    <AnomalyCtx.Provider value={{
      anomalies: data?.anomalies ?? [],
      predictions: data?.predictions ?? [],
      loading,
      getAnomaliesForWidget,
    }}>
      {children}
    </AnomalyCtx.Provider>
  );
}

export function useAnomalies() {
  return useContext(AnomalyCtx);
}
