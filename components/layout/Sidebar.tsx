"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/config/navigation";
import CustomerSelector from "./CustomerSelector";
import { useSidebar } from "@/lib/sidebar-context";
import { RiCloseLine } from "@remixicon/react";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

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
        className={`fixed left-0 top-0 bottom-0 w-[260px] bg-white dark:bg-[#1C1C27] border-r border-gray-200 dark:border-[#2E2E3D] flex flex-col z-30 transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-[#252533]">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="All Is Well" width={180} height={40} className="h-8 w-auto" priority />
          </div>
          <button
            onClick={close}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
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
                    onClick={close}
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
            All Is Well — Digital Health Dashboard
          </div>
        </div>
      </aside>
    </>
  );
}
