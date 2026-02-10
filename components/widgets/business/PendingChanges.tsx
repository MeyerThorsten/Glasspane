"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getPendingChanges } from "@/lib/services/infrastructure-service";
import { ChangeRecord } from "@/types";
import StatusBadge from "@/components/widgets/shared/StatusBadge";

const riskVariant: Record<string, "danger" | "warning" | "success"> = {
  high: "danger",
  medium: "warning",
  low: "success",
};

const statusVariant: Record<string, "info" | "success" | "warning" | "neutral"> = {
  pending: "neutral",
  approved: "success",
  "in-progress": "info",
  completed: "success",
  "rolled-back": "warning",
};

export default function PendingChanges() {
  const { customer } = useCustomer();
  const [data, setData] = useState<ChangeRecord[] | null>(null);

  useEffect(() => {
    if (!customer) return;
    getPendingChanges(customer.id).then(setData);
  }, [customer]);

  if (!data) return <div />;

  if (data.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No pending changes.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-[#2E2E3D] text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <th className="pb-2 pr-4">ID</th>
            <th className="pb-2 pr-4">Title</th>
            <th className="pb-2 pr-4">Scheduled</th>
            <th className="pb-2 pr-4">Risk</th>
            <th className="pb-2 pr-4">Service</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((change) => (
            <tr key={change.id} className="border-b border-gray-100 dark:border-[#252533]">
              <td className="py-2 pr-4 font-mono text-xs text-gray-600 dark:text-gray-400">{change.id}</td>
              <td className="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">{change.title}</td>
              <td className="py-2 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">{change.scheduledDate}</td>
              <td className="py-2 pr-4">
                <StatusBadge label={change.risk} variant={riskVariant[change.risk] ?? "neutral"} />
              </td>
              <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{change.serviceName}</td>
              <td className="py-2">
                <StatusBadge label={change.status} variant={statusVariant[change.status] ?? "neutral"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
