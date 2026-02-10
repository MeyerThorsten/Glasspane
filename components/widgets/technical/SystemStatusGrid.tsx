"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getServicesByCategories } from "@/lib/services/service-service";
import { Service, ServiceStatus } from "@/types";

const statusColor: Record<ServiceStatus, string> = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  outage: "bg-red-500",
  maintenance: "bg-blue-500",
};

const statusLabel: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  maintenance: "Maintenance",
};

export default function SystemStatusGrid() {
  const { customer } = useCustomer();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!customer) return;
    getServicesByCategories(customer.subscribedCategories).then(setServices);
  }, [customer]);

  if (services.length === 0) return <div />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
        {Object.entries(statusColor).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            {statusLabel[status as ServiceStatus]}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-[#252533] bg-gray-50 dark:bg-[#1C1C27] px-3 py-2"
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor[service.status]}`} />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{service.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
