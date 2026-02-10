"use client";

import { useEffect, useState } from "react";
import { useCustomer } from "@/lib/customer-context";
import { getResourceUtilization } from "@/lib/services/infrastructure-service";
import { AreaChart } from "@tremor/react";
import { ResourceUtilization as ResourceUtilizationType } from "@/types";

export default function ResourceUtilization() {
  const { customer } = useCustomer();
  const [data, setData] = useState<ResourceUtilizationType[]>([]);

  useEffect(() => {
    if (!customer) return;
    getResourceUtilization(customer.id).then(setData);
  }, [customer]);

  if (data.length === 0) return null;

  const cpuData = data.map((d) => ({ timestamp: d.timestamp, CPU: d.cpu }));
  const memoryData = data.map((d) => ({ timestamp: d.timestamp, Memory: d.memory }));
  const diskData = data.map((d) => ({ timestamp: d.timestamp, Disk: d.disk }));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">CPU Usage (%)</p>
        <AreaChart
          data={cpuData}
          index="timestamp"
          categories={["CPU"]}
          colors={["blue"]}
          showAnimation
          showLegend={false}
          yAxisWidth={48}
          valueFormatter={(v: number) => `${v}%`}
          className="h-28"
        />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">Memory Usage (%)</p>
        <AreaChart
          data={memoryData}
          index="timestamp"
          categories={["Memory"]}
          colors={["violet"]}
          showAnimation
          showLegend={false}
          yAxisWidth={48}
          valueFormatter={(v: number) => `${v}%`}
          className="h-28"
        />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">Disk Usage (%)</p>
        <AreaChart
          data={diskData}
          index="timestamp"
          categories={["Disk"]}
          colors={["amber"]}
          showAnimation
          showLegend={false}
          yAxisWidth={48}
          valueFormatter={(v: number) => `${v}%`}
          className="h-28"
        />
      </div>
    </div>
  );
}
