"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ViewType } from "@/types";
import { viewConfigs } from "@/config/view-configs";
import { useCustomer } from "@/lib/customer-context";
import WidgetGrid from "@/components/widgets/WidgetGrid";

function DashboardContent() {
  const searchParams = useSearchParams();
  const { customer, loading } = useCustomer();
  const view = (searchParams.get("view") as ViewType) || "c-level";
  const widgets = viewConfigs[view] || viewConfigs["c-level"];

  if (loading) {
    return (
      <div className="widget-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="widget-medium bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
            <div className="h-32 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Filter widgets based on customer subscribed categories
  const filteredWidgets = customer
    ? widgets.filter((w) => {
        if (!w.requiredCategories) return true;
        return w.requiredCategories.some((cat) =>
          customer.subscribedCategories.includes(cat as never)
        );
      })
    : widgets;

  return <WidgetGrid widgets={filteredWidgets} />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="widget-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="widget-medium bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
              <div className="h-32 bg-gray-50 rounded" />
            </div>
          ))}
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
