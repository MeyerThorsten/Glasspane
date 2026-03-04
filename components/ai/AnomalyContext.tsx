"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useCustomer } from "@/lib/customer-context";
import type { AiInsightsResponse, Anomaly, Prediction } from "@/types";

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
    fetch("/api/ai/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch insights");
        return res.json() as Promise<AiInsightsResponse>;
      })
      .then(setData)
      .catch(console.error)
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
