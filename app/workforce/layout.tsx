"use client";

import Sidebar from "@/components/layout/Sidebar";
import PoweredByFooter from "@/components/layout/PoweredByFooter";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { CustomerProvider } from "@/lib/customer-context";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";
import { useCustomer } from "@/lib/customer-context";
import { RiNotification3Line, RiUser3Line, RiMenuLine } from "@remixicon/react";

function WorkforceHeader() {
  const { customer } = useCustomer();
  const { toggle } = useSidebar();

  return (
    <header className="h-16 bg-white dark:bg-[#1C1C27] border-b border-gray-200 dark:border-[#2E2E3D] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button onClick={toggle} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <RiMenuLine className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Workforce</h1>
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
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#262633] flex items-center justify-center">
          <RiUser3Line className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    </header>
  );
}

function ContentArea({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <div className={`transition-[margin] duration-200 ${collapsed ? "lg:ml-[68px]" : "lg:ml-[260px]"}`}>
      <WorkforceHeader />
      <main className="p-6">{children}</main>
      <PoweredByFooter />
    </div>
  );
}

export default function WorkforceLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-[#111118]">
          <Sidebar />
          <ContentArea>{children}</ContentArea>
        </div>
      </SidebarProvider>
    </CustomerProvider>
  );
}
