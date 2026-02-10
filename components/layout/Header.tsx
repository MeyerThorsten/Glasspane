"use client";

import { Suspense } from "react";
import ViewTabs from "./ViewTabs";
import ThemeToggle from "./ThemeToggle";
import { RiNotification3Line, RiUser3Line } from "@remixicon/react";
import { useCustomer } from "@/lib/customer-context";

export default function Header() {
  const { customer } = useCustomer();

  return (
    <header className="h-16 bg-white dark:bg-[#1C1C27] border-b border-gray-200 dark:border-[#2E2E3D] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <Suspense fallback={<div className="h-9 w-64 bg-gray-100 dark:bg-[#262633] rounded-lg animate-pulse" />}>
          <ViewTabs />
        </Suspense>
      </div>

      <div className="flex items-center gap-4">
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
