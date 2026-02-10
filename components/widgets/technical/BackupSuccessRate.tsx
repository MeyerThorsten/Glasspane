"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getBackups } from "@/lib/services/infrastructure-service";
import { BackupStatus } from "@/types";

export default function BackupSuccessRate() {
  const { customer } = useCustomer();
  const [data, setData] = useState<BackupStatus[]>([]);

  useEffect(() => {
    if (!customer) return;
    getBackups(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.map((backup) => {
        const rateColor =
          backup.successRate >= 99
            ? "text-emerald-600"
            : backup.successRate >= 95
            ? "text-amber-600"
            : "text-red-600";

        return (
          <div
            key={backup.serviceName}
            className="rounded-lg border border-gray-100 bg-gray-50 p-3"
          >
            <p className="text-sm font-medium text-gray-700">{backup.serviceName}</p>
            <p className={`text-2xl font-bold mt-1 ${rateColor}`}>
              {backup.successRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last: {new Date(backup.lastBackup).toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
