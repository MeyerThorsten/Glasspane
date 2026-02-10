"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { CustomerProvider } from "@/lib/customer-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-[260px]">
          <Header />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </CustomerProvider>
  );
}
