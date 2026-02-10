"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/config/navigation";
import CustomerSelector from "./CustomerSelector";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white dark:bg-[#1C1C27] border-r border-gray-200 dark:border-[#2E2E3D] flex flex-col z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 dark:border-[#252533]">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-magenta">T</span>
          <span className="text-lg font-light text-gray-800 dark:text-gray-200">-Systems</span>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 ml-1 uppercase tracking-wider">Transparency</span>
        </div>
      </div>

      {/* Customer Selector */}
      <div className="px-3 py-3 border-b border-gray-100 dark:border-[#252533]">
        <CustomerSelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-magenta-50 dark:bg-[#2D1025] text-magenta"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262633] hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-[#252533]">
        <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          Transparency Portal
        </div>
      </div>
    </aside>
  );
}
