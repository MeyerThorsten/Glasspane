"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getChangeCalendar } from "@/lib/services/infrastructure-service";
import { ChangeCalendarEntry } from "@/types";

const riskColor: Record<ChangeCalendarEntry["risk"], string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
};

export default function ChangeCalendar() {
  const { customer } = useCustomer();
  const [data, setData] = useState<ChangeCalendarEntry[]>([]);

  useEffect(() => {
    if (!customer) return;
    getChangeCalendar(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return <div />;

  const weeks: ChangeCalendarEntry[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 text-[10px] text-gray-400 dark:text-gray-500 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="w-10 text-center">{d}</div>
        ))}
      </div>
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-10 h-10 rounded flex items-center justify-center text-xs font-semibold ${riskColor[day.risk]}`}
                title={`${day.date}: ${day.count} changes (${day.risk} risk)`}
              >
                {day.count}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/40" /> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/40" /> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/40" /> High
        </span>
      </div>
    </div>
  );
}
