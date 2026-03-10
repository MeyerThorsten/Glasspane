"use client";

import { Suspense } from "react";
import ViewTabs from "./ViewTabs";
import ThemeToggle from "./ThemeToggle";
import AutoRefreshToggle from "./AutoRefreshToggle";
import { RiNotification3Line, RiUser3Line, RiMenuLine } from "@remixicon/react";
import { useCustomer } from "@/lib/customer-context";
import { useSidebar } from "@/lib/sidebar-context";

export default function Header({
  onResetLayout,
  hasCustomOrder,
}: {
  onResetLayout?: () => void;
  hasCustomOrder?: boolean;
}) {
  const { customer } = useCustomer();
  const { toggle } = useSidebar();

  return (
    <header className="h-16 bg-white dark:bg-[#1C1C27] border-b border-gray-200 dark:border-[#2E2E3D] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={toggle}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <RiMenuLine className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 shrink-0">Dashboard</h1>
        <div className="overflow-x-auto">
          <Suspense fallback={<div className="h-9 w-64 bg-gray-100 dark:bg-[#262633] rounded-lg animate-pulse" />}>
            <ViewTabs />
          </Suspense>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {hasCustomOrder && onResetLayout && (
          <button
            onClick={onResetLayout}
            className="text-xs font-medium text-gray-500 hover:text-magenta dark:text-gray-400 dark:hover:text-magenta transition-colors whitespace-nowrap"
          >
            Reset Layout
          </button>
        )}
        <AutoRefreshToggle />
        {customer && (
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
            {customer.name}
          </span>
        )}
        <ThemeToggle />
        <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
          <RiNotification3Line className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-magenta rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#262633] flex items-center justify-center">
          <RiUser3Line className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </header>
  );
}
