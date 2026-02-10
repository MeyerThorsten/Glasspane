"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getErrorRates } from "@/lib/services/infrastructure-service";
import { LineChart } from "@tremor/react";
import { ErrorRate } from "@/types";

export default function ErrorRateByService() {
  const { customer } = useCustomer();
  const [data, setData] = useState<ErrorRate[]>([]);

  useEffect(() => {
    if (!customer) return;
    getErrorRates(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const serviceNames = [...new Set(data.map((d) => d.serviceName))];

  const timestamps = [...new Set(data.map((d) => d.timestamp))];
  const chartData = timestamps.map((ts) => {
    const row: Record<string, string | number> = { timestamp: ts };
    serviceNames.forEach((name) => {
      const entry = data.find((d) => d.timestamp === ts && d.serviceName === name);
      row[name] = entry ? entry.rate : 0;
    });
    return row;
  });

  const colors = ["rose", "amber", "blue", "violet", "cyan", "emerald", "fuchsia"];

  return (
    <div>
      <LineChart
        data={chartData}
        index="timestamp"
        categories={serviceNames}
        colors={colors.slice(0, serviceNames.length)}
        yAxisWidth={56}
        showAnimation
        curveType="monotone"
        valueFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
        className="h-64"
      />
    </div>
  );
}
