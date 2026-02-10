"use client";

import { useCustomer } from "@/lib/customer-context";
import { RiArrowDownSLine, RiBuilding2Line } from "@remixicon/react";
import { useState, useRef, useEffect } from "react";

export default function CustomerSelector() {
  const { customer, customers, setCustomerId } = useCustomer();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!customer) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-[#262633] transition-colors text-left"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-magenta-50 text-magenta text-xs font-bold">
          {customer.logoInitials}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{customer.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{customer.tier}</div>
        </div>
        <RiArrowDownSLine className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#1C1C27] border border-gray-200 dark:border-[#2E2E3D] rounded-lg shadow-lg z-50">
          {customers.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCustomerId(c.id);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#262633] transition-colors first:rounded-t-lg last:rounded-b-lg ${
                c.id === customer.id ? "bg-magenta-50 dark:bg-[#2D1025]" : ""
              }`}
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 dark:bg-[#262633] text-gray-600 dark:text-gray-400 text-xs font-bold">
                {c.logoInitials}
              </span>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100">{c.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{c.industry} &middot; {c.tier}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
