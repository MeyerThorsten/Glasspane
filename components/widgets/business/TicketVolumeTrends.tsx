"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getTicketVolume } from "@/lib/services/incident-service";
import { TicketVolume } from "@/types";
import { AreaChart } from "@tremor/react";

export default function TicketVolumeTrends() {
  const { customer } = useCustomer();
  const [data, setData] = useState<TicketVolume[] | null>(null);

  useEffect(() => {
    if (!customer) return;
    getTicketVolume(customer.id).then(setData);
  }, [customer]);

  if (!data) return null;

  const chartData = data.map((d) => ({
    month: d.month,
    Opened: d.opened,
    Resolved: d.resolved,
  }));

  return (
    <div>
      <AreaChart
        data={chartData}
        index="month"
        categories={["Opened", "Resolved"]}
        colors={["fuchsia", "emerald"]}
        valueFormatter={(v) => `${v}`}
        yAxisWidth={40}
        className="h-64"
      />
    </div>
  );
}
