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
  dragListeners?: Record<string, Function>;
  animationDelay?: number;
}

const sizeClasses: Record<WidgetSize, string> = {
  small: "widget-small",
  medium: "widget-medium",
  large: "widget-large",
  full: "widget-full",
};

export default function WidgetShell({ title, size, children, loading, error, widgetId, dragListeners, animationDelay }: WidgetShellProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className={`${dragListeners ? "" : sizeClasses[size] + " "}bg-white dark:bg-[#1C1C27] rounded-xl border border-gray-200 dark:border-[#2E2E3D] shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
        style={{ animation: `fadeSlideUp 0.3s ease-out ${animationDelay || 0}ms both` }}
      >
        <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2E2E3D]">
          <div className="flex items-center gap-2">
            {dragListeners && (
              <button
                className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 touch-none"
                {...dragListeners}
              >
                <i className="ri-draggable text-sm" />
              </button>
            )}
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
            <div className="space-y-3">
              <div className="h-4 rounded w-3/4" style={{ background: "linear-gradient(90deg, transparent 25%, rgba(0,0,0,0.04) 50%, transparent 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              <div className="h-32 rounded" style={{ background: "linear-gradient(90deg, transparent 25%, rgba(0,0,0,0.04) 50%, transparent 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              <div className="h-4 rounded w-1/2" style={{ background: "linear-gradient(90deg, transparent 25%, rgba(0,0,0,0.04) 50%, transparent 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
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
