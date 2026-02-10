"use client";

import { ReactNode } from "react";
import { WidgetSize } from "@/types";

interface WidgetShellProps {
  title: string;
  size: WidgetSize;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
}

const sizeClasses: Record<WidgetSize, string> = {
  small: "widget-small",
  medium: "widget-medium",
  large: "widget-large",
  full: "widget-full",
};

export default function WidgetShell({ title, size, children, loading, error }: WidgetShellProps) {
  return (
    <div className={`${sizeClasses[size]} bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden`}>
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-5 min-h-[100px]">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-32 bg-gray-50 rounded" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
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
  );
}
