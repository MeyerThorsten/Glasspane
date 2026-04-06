"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getServiceUtilization } from "@/lib/services/infrastructure-service";
import { ServiceUtilization as ServiceUtilizationType } from "@/types";
import { BarChart } from "@tremor/react";

export default function ServiceUtilization() {
  const { customer } = useCustomer();
  const [data, setData] = useState<ServiceUtilizationType[] | null>(null);

  useEffect(() => {
    if (!customer) return;
    getServiceUtilization(customer.id).then(setData);
  }, [customer]);

  if (!data) return <div />;

  const chartData = data.map((svc) => {
    const lastMonth = svc.months[svc.months.length - 1];
    const shortName = svc.serviceName
      .replace("Cloud Platform", "Cloud")
      .replace("SAP S/4HANA Managed", "SAP S/4HANA")
      .replace("Managed Security (SOC)", "Security SOC")
      .replace("Digital Workplace", "Workplace")
      .replace("AI & Data Analytics Platform", "AI & Data");
    return {
      service: shortName,
      Usage: lastMonth?.usage ?? 0,
      Capacity: (lastMonth?.capacity ?? 0) - (lastMonth?.usage ?? 0),
    };
  });

  return (
    <div>
      <BarChart
        data={chartData}
        index="service"
        categories={["Usage", "Capacity"]}
        colors={["blue", "emerald"]}
        stack
        valueFormatter={(v: number) => `${v}%`}
        yAxisWidth={48}
        tickGap={2}
        className="h-64"
        showAnimation
      />
    </div>
  );
}
