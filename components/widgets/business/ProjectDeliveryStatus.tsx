"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getProjects } from "@/lib/services/infrastructure-service";
import { ProjectDelivery } from "@/types";
import { ProgressBar } from "@tremor/react";
import StatusBadge from "@/components/widgets/shared/StatusBadge";

const statusVariant: Record<ProjectDelivery["status"], "success" | "warning" | "danger" | "info" | "neutral"> = {
  "on-track": "success",
  "at-risk": "warning",
  delayed: "danger",
  completed: "info",
};

export default function ProjectDeliveryStatus() {
  const { customer } = useCustomer();
  const [data, setData] = useState<ProjectDelivery[] | null>(null);

  useEffect(() => {
    if (!customer) return;
    getProjects(customer.id).then(setData);
  }, [customer]);

  if (!data) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="pb-2 pr-4">Project</th>
            <th className="pb-2 pr-4 w-40">Progress</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2 pr-4">Due Date</th>
            <th className="pb-2">Owner</th>
          </tr>
        </thead>
        <tbody>
          {data.map((project) => (
            <tr key={project.id} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium text-gray-900">{project.name}</td>
              <td className="py-2 pr-4">
                <div className="flex items-center gap-2">
                  <ProgressBar value={project.progress} color="fuchsia" className="w-24" />
                  <span className="text-xs text-gray-500">{project.progress}%</span>
                </div>
              </td>
              <td className="py-2 pr-4">
                <StatusBadge label={project.status} variant={statusVariant[project.status]} />
              </td>
              <td className="py-2 pr-4 text-gray-600">{project.dueDate}</td>
              <td className="py-2 text-gray-600">{project.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
