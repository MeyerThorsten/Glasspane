"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getDigitalTransformation } from "@/lib/services/zero-outage-service";
import { ProgressBar } from "@tremor/react";
import { DigitalTransformationMilestone } from "@/types";
import StatusBadge from "@/components/widgets/shared/StatusBadge";

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  "on-track": "success",
  "at-risk": "warning",
  delayed: "danger",
  completed: "info",
};

const statusLabel: Record<string, string> = {
  "on-track": "On Track",
  "at-risk": "At Risk",
  delayed: "Delayed",
  completed: "Completed",
};

export default function DigitalTransformation() {
  const { customer } = useCustomer();
  const [milestones, setMilestones] = useState<DigitalTransformationMilestone[]>([]);

  useEffect(() => {
    if (!customer) return;
    getDigitalTransformation(customer.id).then(setMilestones);
  }, [customer]);

  if (milestones.length === 0) return null;

  const avgProgress = Math.round(
    milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
        <p className="text-xs text-gray-500">Average Progress</p>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone) => {
          const color =
            milestone.status === "completed"
              ? "blue"
              : milestone.status === "on-track"
              ? "emerald"
              : milestone.status === "at-risk"
              ? "amber"
              : "red";

          return (
            <div key={milestone.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 truncate">{milestone.name}</span>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <span className="text-sm font-semibold text-gray-900">{milestone.progress}%</span>
                  <StatusBadge
                    label={statusLabel[milestone.status]}
                    variant={statusVariant[milestone.status]}
                  />
                </div>
              </div>
              <ProgressBar value={milestone.progress} color={color} showAnimation />
            </div>
          );
        })}
      </div>
    </div>
  );
}
