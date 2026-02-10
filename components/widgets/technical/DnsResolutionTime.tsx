"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getDnsResolution } from "@/lib/services/infrastructure-service";
import { AreaChart } from "@tremor/react";
import { DnsResolution } from "@/types";

export default function DnsResolutionTime() {
  const { customer } = useCustomer();
  const [data, setData] = useState<DnsResolution[]>([]);

  useEffect(() => {
    if (!customer) return;
    getDnsResolution(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const currentAvg = data[data.length - 1].avgMs;
  const chartData = data.map((d) => ({
    timestamp: d.timestamp,
    "Avg (ms)": d.avgMs,
  }));

  return (
    <div className="space-y-3">
      <div>
        <p className="text-3xl font-bold text-gray-900">{currentAvg.toFixed(1)} ms</p>
        <p className="text-xs text-gray-500">Current Avg Resolution Time</p>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">7-Day Trend</p>
        <AreaChart
          data={chartData}
          index="timestamp"
          categories={["Avg (ms)"]}
          colors={["blue"]}
          showAnimation
          showLegend={false}
          showYAxis={false}
          showGridLines={false}
          curveType="monotone"
          className="h-20"
        />
      </div>
    </div>
  );
}
