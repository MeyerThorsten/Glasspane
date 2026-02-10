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

  if (!data) return null;

  const chartData = data.map((svc) => {
    const lastMonth = svc.months[svc.months.length - 1];
    return {
      service: svc.serviceName,
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
        colors={["fuchsia", "gray"]}
        stack
        valueFormatter={(v: number) => `${v}%`}
        yAxisWidth={48}
        className="h-64"
        showAnimation
      />
    </div>
  );
}
