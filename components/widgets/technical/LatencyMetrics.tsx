"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getLatencyMetrics } from "@/lib/services/infrastructure-service";
import { LineChart } from "@tremor/react";
import { LatencyMetric } from "@/types";

export default function LatencyMetrics() {
  const { customer } = useCustomer();
  const [data, setData] = useState<LatencyMetric[]>([]);

  useEffect(() => {
    if (!customer) return;
    getLatencyMetrics(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    timestamp: d.timestamp,
    P50: d.p50,
    P95: d.p95,
    P99: d.p99,
  }));

  return (
    <div>
      <LineChart
        data={chartData}
        index="timestamp"
        categories={["P50", "P95", "P99"]}
        colors={["emerald", "amber", "rose"]}
        yAxisWidth={56}
        showAnimation
        curveType="monotone"
        valueFormatter={(v: number) => `${v} ms`}
        className="h-64"
      />
    </div>
  );
}
