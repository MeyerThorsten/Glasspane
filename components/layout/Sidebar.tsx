"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/config/navigation";
import CustomerSelector from "./CustomerSelector";
import { useSidebar } from "@/lib/sidebar-context";
import { RiCloseLine, RiMenuFoldLine, RiMenuUnfoldLine } from "@remixicon/react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, collapsed, close, toggleCollapse } = useSidebar();

  return (
    <>
      {/* Backdrop — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 bg-white dark:bg-[#1C1C27] border-r border-gray-200 dark:border-[#2E2E3D] flex flex-col z-30 transition-all duration-200 ${
          collapsed ? "w-[68px]" : "w-[260px]"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className={`flex items-center justify-between border-b border-gray-100 dark:border-[#252533] ${collapsed ? "px-3 py-4" : "px-5 py-5"}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className={`font-bold text-gray-900 dark:text-white whitespace-nowrap ${collapsed ? "text-lg" : "text-xl"}`}>
              {collapsed ? "AiW" : "All Is Well"}
            </span>
          </div>
          <button
            onClick={close}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Selector */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-gray-100 dark:border-[#252533]">
            <CustomerSelector />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={close}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isActive
                        ? "bg-magenta-50 dark:bg-[#1e1b4b] text-magenta"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262633] hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle — desktop only */}
        <div className="hidden lg:flex px-3 py-3 border-t border-gray-100 dark:border-[#252533] justify-center">
          <button
            onClick={toggleCollapse}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-[#262633] transition-colors w-full justify-center"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <RiMenuUnfoldLine className="w-5 h-5" />
            ) : (
              <>
                <RiMenuFoldLine className="w-5 h-5" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-[#252533]">
            <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
              All Is Well — Digital Health Dashboard
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
