"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getRecommendedActions } from "@/lib/services/action-service";
import { ActionSeverity, RecommendedAction } from "@/types";
import { RiAlarmWarningLine, RiErrorWarningLine, RiInformationLine } from "@remixicon/react";

const severityStyles: Record<
  ActionSeverity,
  { icon: typeof RiAlarmWarningLine; badge: string; label: string }
> = {
  critical: {
    icon: RiAlarmWarningLine,
    badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    label: "Critical",
  },
  warning: {
    icon: RiErrorWarningLine,
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    label: "Warning",
  },
  info: {
    icon: RiInformationLine,
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    label: "Info",
  },
};

export default function ActionCenter() {
  const { customer } = useCustomer();
  const [actions, setActions] = useState<RecommendedAction[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;
    getRecommendedActions(customer.id).then(setActions);
  }, [customer]);

  if (!actions) return <div />;

  return (
    <div className="space-y-2">
      {actions.map((action) => {
        const style = severityStyles[action.severity];
        const Icon = style.icon;
        const isOpen = expanded === action.id;
        return (
          <div
            key={action.id}
            className="border border-gray-200 dark:border-[#2E2E3D] rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isOpen ? null : action.id)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#1F1F2B] transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0 text-gray-400" />
              <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {action.title}
              </span>
              <span className="text-[11px] text-gray-400 hidden sm:block">{action.category}</span>
              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${style.badge}`}>
                {style.label}
              </span>
            </button>
            {isOpen && (
              <div className="px-3 pb-3 pt-1 space-y-2 bg-gray-50/50 dark:bg-[#1A1A24]">
                <p className="text-sm text-gray-600 dark:text-gray-400">{action.rationale}</p>
                <ul className="space-y-1">
                  {action.suggestedSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 select-none">{idx + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
