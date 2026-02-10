"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getServicesByCategories } from "@/lib/services/service-service";
import { Service, ServiceStatus } from "@/types";
import StatusBadge from "@/components/widgets/shared/StatusBadge";

const statusConfig: Record<ServiceStatus, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
  operational: { label: "Operational", variant: "success" },
  degraded: { label: "Degraded", variant: "warning" },
  outage: { label: "Outage", variant: "danger" },
  maintenance: { label: "Maintenance", variant: "info" },
};

export default function ServiceHealthOverview() {
  const { customer } = useCustomer();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!customer) return;
    getServicesByCategories(customer.subscribedCategories).then(setServices);
  }, [customer]);

  if (services.length === 0) return <div />;

  const operational = services.filter((s) => s.status === "operational").length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{operational}</span>
        <span className="text-gray-400 dark:text-gray-500"> / {services.length}</span> services operational
      </p>

      <div className="grid grid-cols-1 gap-2">
        {services.map((service) => {
          const cfg = statusConfig[service.status];
          return (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-[#252533] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{service.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{service.category}</p>
              </div>
              <div className="flex items-center gap-3 ml-2">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{service.uptime.toFixed(3)}%</span>
                <StatusBadge label={cfg.label} variant={cfg.variant} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
