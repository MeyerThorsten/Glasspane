"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getServicesByCategories } from "@/lib/services/service-service";
import { BarList } from "@tremor/react";
import { Service } from "@/types";

export default function UptimeByService() {
  const { customer } = useCustomer();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!customer) return;
    getServicesByCategories(customer.subscribedCategories).then(setServices);
  }, [customer]);

  if (services.length === 0) return null;

  const barData = services
    .sort((a, b) => b.uptime - a.uptime)
    .map((s) => {
      const belowTarget = s.uptime < s.slaTarget;
      const nearTarget = s.uptime >= s.slaTarget && s.uptime < s.slaTarget + 0.05;
      return {
        name: `${s.name} (${s.uptime.toFixed(2)}%)`,
        value: s.uptime,
        color: belowTarget ? "red" : nearTarget ? "amber" : "emerald",
      };
    });

  return (
    <div className="space-y-2">
      <BarList data={barData} className="mt-2" />
    </div>
  );
}
