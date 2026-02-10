"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getMttrTrends } from "@/lib/services/incident-service";
import { MttrTrend } from "@/types";
import { LineChart } from "@tremor/react";

export default function MttrTrends() {
  const { customer } = useCustomer();
  const [data, setData] = useState<MttrTrend[] | null>(null);

  useEffect(() => {
    if (!customer) return;
    getMttrTrends(customer.id).then(setData);
  }, [customer]);

  if (!data) return <div />;

  const chartData = data.map((d) => ({
    month: d.month,
    P1: d.p1,
    P2: d.p2,
    P3: d.p3,
    P4: d.p4,
  }));

  return (
    <div>
      <LineChart
        data={chartData}
        index="month"
        categories={["P1", "P2", "P3", "P4"]}
        colors={["rose", "fuchsia", "amber", "gray"]}
        valueFormatter={(v) => `${v} min`}
        yAxisWidth={64}
        className="h-64"
      />
    </div>
  );
}
