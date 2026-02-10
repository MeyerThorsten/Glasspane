"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getSlaHistory } from "@/lib/services/kpi-service";
import { MonthlySla } from "@/types";
import { AreaChart } from "@tremor/react";

export default function ServiceAvailabilityTrend() {
  const { customer } = useCustomer();
  const [data, setData] = useState<MonthlySla[] | null>(null);

  useEffect(() => {
    if (!customer) return;
    getSlaHistory(customer.id).then(setData);
  }, [customer]);

  if (!data) return null;

  const chartData = data.map((d) => ({
    month: d.month,
    Availability: d.availability,
    Target: d.target,
  }));

  return (
    <div>
      <AreaChart
        data={chartData}
        index="month"
        categories={["Availability", "Target"]}
        colors={["fuchsia", "gray"]}
        valueFormatter={(v: number) => `${v.toFixed(3)}%`}
        yAxisWidth={80}
        className="h-64"
        curveType="monotone"
        minValue={99.99}
        maxValue={100.0}
        showAnimation
      />
    </div>
  );
}
