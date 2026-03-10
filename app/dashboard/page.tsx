"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useRef } from "react";
import { ViewType } from "@/types";
import { viewConfigs } from "@/config/view-configs";
import { useCustomer } from "@/lib/customer-context";
import { useWidgetOrder } from "@/lib/use-widget-order";
import { useFavorites } from "@/lib/use-widget-favorites";
import WidgetGrid from "@/components/widgets/WidgetGrid";
import ZeroOutageBanner from "@/components/layout/ZeroOutageBanner";
import AiChatPanel from "@/components/ai/AiChatPanel";
import Header from "@/components/layout/Header";
import WidgetSearch from "@/components/layout/WidgetSearch";

function DashboardContent() {
  const searchParams = useSearchParams();
  const { customer, loading } = useCustomer();
  const view = (searchParams.get("view") as ViewType) || "c-level";
  const defaultWidgets = viewConfigs[view] || viewConfigs["c-level"];
  const { widgets: orderedWidgets, reorder, reset, hasCustomOrder } = useWidgetOrder(view, defaultWidgets);
  const { isFavorite, toggleFavorite } = useFavorites(view);
  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <>
        <Header />
        <main className="p-6">
          <div className="widget-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="widget-medium bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="h-32 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        </main>
      </>
    );
  }

  // Filter widgets based on customer subscribed categories
  const filteredWidgets = customer
    ? orderedWidgets.filter((w) => {
        if (!w.requiredCategories) return true;
        return w.requiredCategories.some((cat) =>
          customer.subscribedCategories.includes(cat as never)
        );
      })
    : orderedWidgets;

  const sortedWidgets = [...filteredWidgets].sort((a, b) => {
    const aFav = isFavorite(a.id) ? 0 : 1;
    const bFav = isFavorite(b.id) ? 0 : 1;
    return aFav - bFav;
  });

  const categories = [...new Set(sortedWidgets.map((w) => w.category))];

  const dimmedWidgets = new Set<string>();
  if (searchText || selectedCategories.length > 0) {
    sortedWidgets.forEach((w) => {
      const matchesSearch = !searchText || w.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(w.category);
      if (!matchesSearch || !matchesCategory) dimmedWidgets.add(w.id);
    });
  }

  return (
    <>
      <Header onResetLayout={reset} hasCustomOrder={hasCustomOrder} gridRef={gridRef} />
      <main className="p-6">
        <ZeroOutageBanner />
        <WidgetSearch
          categories={categories}
          onFilter={(text, cats) => {
            setSearchText(text);
            setSelectedCategories(cats);
          }}
        />
        <WidgetGrid
          widgets={sortedWidgets}
          onReorder={reorder}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          dimmedWidgets={dimmedWidgets}
          gridRef={gridRef}
        />
        <AiChatPanel view={view} />
      </main>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="p-6">
            <div className="widget-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="widget-medium bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
                  <div className="h-32 bg-gray-50 rounded" />
                </div>
              ))}
            </div>
          </main>
        </>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
