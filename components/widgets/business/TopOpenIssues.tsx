"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getOpenIncidents } from "@/lib/services/incident-service";
import { Incident } from "@/types";
import StatusBadge from "@/components/widgets/shared/StatusBadge";

const severityVariant: Record<string, "danger" | "warning" | "info" | "neutral"> = {
  P1: "danger",
  P2: "warning",
  P3: "info",
  P4: "neutral",
};

export default function TopOpenIssues() {
  const { customer } = useCustomer();
  const [data, setData] = useState<Incident[] | null>(null);

  useEffect(() => {
    if (!customer) return;
    getOpenIncidents(customer.id).then(setData);
  }, [customer]);

  if (!data) return null;

  if (data.length === 0) {
    return <p className="text-sm text-gray-500">No open issues.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="pb-2 pr-4">ID</th>
            <th className="pb-2 pr-4">Title</th>
            <th className="pb-2 pr-4">Severity</th>
            <th className="pb-2 pr-4">Service</th>
            <th className="pb-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {data.map((incident) => (
            <tr key={incident.id} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-mono text-xs text-gray-600">{incident.id}</td>
              <td className="py-2 pr-4 font-medium text-gray-900">{incident.title}</td>
              <td className="py-2 pr-4">
                <StatusBadge label={incident.severity} variant={severityVariant[incident.severity] ?? "neutral"} />
              </td>
              <td className="py-2 pr-4 text-gray-600">{incident.serviceName}</td>
              <td className="py-2 text-gray-600 whitespace-nowrap">
                {new Date(incident.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
