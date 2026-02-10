"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getServicesByCategories } from "@/lib/services/service-service";
import { Service } from "@/types";
import { BarList } from "@tremor/react";

export default function SlaComplianceByService() {
  const { customer } = useCustomer();
  const [data, setData] = useState<Service[] | null>(null);

  useEffect(() => {
    if (!customer) return;
    getServicesByCategories(customer.subscribedCategories).then(setData);
  }, [customer]);

  if (!data) return <div />;

  const sorted = [...data].sort((a, b) => b.uptime - a.uptime);

  const barData = sorted.map((svc) => ({
    name: `${svc.name} (${svc.uptime}%)`,
    value: svc.uptime,
    color: svc.uptime >= svc.slaTarget ? "emerald" : "rose",
  }));

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Meets SLA
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Below SLA
        </span>
      </div>
      <BarList
        data={barData}
        valueFormatter={(v: number) => `${v}%`}
        className="mt-2"
      />
    </div>
  );
}
