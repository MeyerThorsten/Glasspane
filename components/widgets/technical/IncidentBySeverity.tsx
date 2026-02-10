"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getIncidentSummary } from "@/lib/services/incident-service";
import { BarChart } from "@tremor/react";
import { IncidentSummary } from "@/types";

export default function IncidentBySeverity() {
  const { customer } = useCustomer();
  const [data, setData] = useState<IncidentSummary[]>([]);

  useEffect(() => {
    if (!customer) return;
    getIncidentSummary(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    severity: d.severity,
    Open: d.open,
    Resolved: d.resolved,
  }));

  return (
    <div>
      <BarChart
        data={chartData}
        index="severity"
        categories={["Open", "Resolved"]}
        colors={["rose", "emerald"]}
        stack
        yAxisWidth={40}
        showAnimation
        allowDecimals={false}
        className="h-64"
      />
    </div>
  );
}
