"use client";

import { ReactNode, useState } from "react";
import { WidgetSize } from "@/types";
import AnomalyBadge from "@/components/ai/AnomalyBadge";
import DataFreshness from "@/components/widgets/shared/DataFreshness";
import WidgetExpandModal from "@/components/widgets/WidgetExpandModal";

interface WidgetShellProps {
  title: string;
  size: WidgetSize;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  widgetId?: string;
}

const sizeClasses: Record<WidgetSize, string> = {
  small: "widget-small",
  medium: "widget-medium",
  large: "widget-large",
  full: "widget-full",
};

export default function WidgetShell({ title, size, children, loading, error, widgetId }: WidgetShellProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className={`${sizeClasses[size]} bg-white dark:bg-[#1C1C27] rounded-xl border border-gray-200 dark:border-[#2E2E3D] shadow-sm overflow-hidden`}>
        <div className="px-5 py-4 border-b border-gray-100 dark:border-[#252533]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            {widgetId && <AnomalyBadge widgetId={widgetId} />}
            <div className="ml-auto flex items-center gap-2">
              <DataFreshness />
              <button
                onClick={() => setExpanded(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Expand widget"
              >
                <i className="ri-fullscreen-line text-sm" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-5 min-h-[100px]">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-3/4" />
              <div className="h-32 bg-gray-50 dark:bg-[#1C1C27] rounded" />
              <div className="h-4 bg-gray-100 dark:bg-[#262633] rounded w-1/2" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-sm text-danger">
              {error}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
      {expanded && (
        <WidgetExpandModal title={title} onClose={() => setExpanded(false)}>
          {children}
        </WidgetExpandModal>
      )}
    </>
  );
}
